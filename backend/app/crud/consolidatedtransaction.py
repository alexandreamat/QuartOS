# Copyright (C) 2024 Alexandre Amat
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.


import itertools
import logging
from typing import Any, Iterable

import pydantic_core
from sqlalchemy import (
    ColumnExpressionArgument,
    Row,
    Select,
    asc,
    desc,
    func,
    or_,
    select,
    case,
)
from sqlalchemy.orm import Session

from app.models.account import Account, NonInstitutionalAccount
from app.models.common import CalculatedColumnsMeta
from app.models.transaction import Transaction
from app.models.transactiongroup import TransactionGroup
from app.models.userinstitutionlink import UserInstitutionLink
from app.schemas.transaction import TransactionApiOut
from app.schemas.transactiongroup import TransactionGroupApiOut
from app.utils.common import get_search_expressions

logger = logging.getLogger(__name__)


class ConsolidatedTransaction(metaclass=CalculatedColumnsMeta):
    id = func.coalesce(-TransactionGroup.id, Transaction.id)
    name = func.coalesce(func.min(TransactionGroup.name), func.min(Transaction.name))
    category_id = func.coalesce(
        func.min(TransactionGroup.category_id), func.min(Transaction.category_id)
    )
    transaction_group_id = func.min(TransactionGroup.id)
    amount_default_currency = TransactionGroup.amount_default_currency.expression
    timestamp = TransactionGroup.timestamp.expression
    amount = TransactionGroup.amount.expression
    account_id = TransactionGroup.account_id.expression
    transactions_count = TransactionGroup.transactions_count.expression
    account_balance = func.min(Transaction.account_balance)
    is_synced = case((func.min(Transaction.plaid_id) != None, True), else_=False)


def get_query_expressions(
    model: Any, **kwargs: Any
) -> Iterable[ColumnExpressionArgument[bool]]:
    # Handle kwargs like amount__gt, amount__le__abs, timestamp__eq...
    # to construct model.amount > arg, abs(model.amount) <= arg, ...
    for kw, arg in kwargs.items():
        if arg is None:
            continue
        attr_name, *ops = kw.split("__")
        attr = getattr(model, attr_name)
        if len(ops) == 2:
            f = {"abs": abs}[ops[1]]
            attr = f(attr)
        yield getattr(attr, f"__{ops[0]}__")(arg)


class CRUDConsolidatedTransaction:
    @classmethod
    def select(
        cls,
        *,
        user_id: int | None = None,
        search: str | None = None,
        consolidated: bool = False,
        per_page: int = 0,
        page: int = 0,
        order_by: str | None = None,
        **kwargs: Any,
    ) -> Select[tuple[Any, ...]]:
        model = ConsolidatedTransaction if consolidated else Transaction

        exprs = get_query_expressions(model, **kwargs)
        if search:
            exprs = itertools.chain(get_search_expressions(search, model.name))

        # SELECT
        statement = select(
            model.id,
            model.name,
            model.category_id,
            model.transaction_group_id,
            model.amount_default_currency,
            model.timestamp,
            model.amount,
            model.account_id,
            model.transactions_count,
            model.account_balance,
            model.is_synced,
        )

        # JOIN
        if consolidated:
            statement = statement.outerjoin(TransactionGroup)
        statement = statement.join(Account)
        statement = statement.outerjoin(UserInstitutionLink)

        # WHERE
        statement = statement.where(
            or_(
                NonInstitutionalAccount.user_id == user_id,
                UserInstitutionLink.user_id == user_id,
            )
        )

        if not consolidated:
            for exp in exprs:
                statement = statement.where(exp)

        # GROUP BY
        if consolidated:
            statement = statement.group_by(ConsolidatedTransaction.id)

        # HAVING
        if consolidated:
            for exp in exprs:
                statement = statement.having(exp)

        # ORDER BY
        if order_by:
            attr, op = order_by.split("__")
            f = {"asc": asc, "desc": desc}[op]
            statement = statement.order_by(f(getattr(model, attr)), f(model.id))

        # OFFSET and LIMIT
        if per_page:
            offset = page * per_page
            statement = statement.offset(offset).limit(per_page)

        return statement

    @classmethod
    def model_validate(
        cls, transaction: Row[tuple[Any, ...]]
    ) -> TransactionApiOut | TransactionGroupApiOut:
        try:
            return TransactionApiOut(
                id=transaction.id,
                name=transaction.name,
                category_id=transaction.category_id,
                transaction_group_id=transaction.transaction_group_id,
                amount_default_currency=transaction.amount_default_currency,
                timestamp=transaction.timestamp,
                amount=transaction.amount,
                account_id=transaction.account_id,
                account_balance=transaction.account_balance,
                is_synced=transaction.is_synced,
                consolidated=False,
            )
        except pydantic_core.ValidationError as e:
            return TransactionGroupApiOut(
                id=-transaction.id,
                name=transaction.name,
                category_id=transaction.category_id,
                amount_default_currency=transaction.amount_default_currency,
                timestamp=transaction.timestamp,
                amount=transaction.amount,
                account_id=transaction.account_id,
                transactions_count=transaction.transactions_count,
                consolidated=True,
            )

    @classmethod
    def read_many(
        cls, db: Session, **kwargs: Any
    ) -> Iterable[TransactionApiOut | TransactionGroupApiOut]:
        for transaction in db.execute(cls.select(**kwargs)):
            yield cls.model_validate(transaction)

    @classmethod
    def read(
        cls, db: Session, **kwargs: Any
    ) -> TransactionApiOut | TransactionGroupApiOut:
        transaction = db.execute(cls.select(**kwargs)).one()
        return cls.model_validate(transaction)
