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


from datetime import date
from decimal import Decimal
import logging
from typing import Any, Iterable
from sqlalchemy import Select, asc, desc, func, or_, select
from sqlalchemy.orm import Session
from app.models.account import Account, NonInstitutionalAccount
from app.models.common import CalculatedColumnsMeta

from app.models.movement import Movement
from app.models.transaction import Transaction
from app.models.userinstitutionlink import UserInstitutionLink
from app.schemas.movement import MovementApiOut
from app.schemas.transaction import TransactionApiOut
from app.utils.common import filter_query_by_search

logger = logging.getLogger(__name__)


class ConsolidatedTransaction(metaclass=CalculatedColumnsMeta):
    id = func.coalesce(-Movement.id, Transaction.id)
    name = func.coalesce(Movement.name, Transaction.name)
    category_id = func.coalesce(Movement.category_id, Transaction.category_id)


class CRUDConsolidatedTransaction:
    @classmethod
    def select(
        cls,
        *,
        id: int | None = None,
        user_id: int | None = None,
        account_id: int | None = None,
        search: str | None = None,
        timestamp_ge: date | None = None,
        timestamp_le: date | None = None,
        is_descending: bool = True,
        amount_ge: Decimal | None = None,
        amount_le: Decimal | None = None,
        is_amount_abs: bool = False,
        consolidated: bool = False,
        per_page: int = 0,
        page: int = 0,
    ) -> Select[tuple[Any, ...]]:
        model = ConsolidatedTransaction if consolidated else Transaction

        # SELECT
        if consolidated:
            statement = select(
                ConsolidatedTransaction.id,
                ConsolidatedTransaction.name,
                ConsolidatedTransaction.category_id,
                Movement.amount_default_currency,
                Movement.timestamp,
                Movement.amount,
                Movement.id.label("movement_id"),
                Movement.account_id,
                Movement.transactions_count,
            )
        else:
            statement = select(
                Transaction.id,
                Transaction.name,
                Transaction.category_id,
                Transaction.amount_default_currency,
                Transaction.timestamp,
                Transaction.amount,
                Transaction.movement_id,
                Transaction.account_id,
                Transaction.account_balance,
                Transaction.is_synced,
            )

        # JOIN
        if consolidated:
            statement = statement.outerjoin(Movement)
        statement = statement.join(Account)
        statement = statement.outerjoin(UserInstitutionLink)

        # WHERE
        statement = statement.where(
            or_(
                NonInstitutionalAccount.user_id == user_id,
                UserInstitutionLink.user_id == user_id,
            )
        )
        if account_id:
            statement = statement.where(Account.id == account_id)
        if id is not None:
            statement = statement.where(model.id == id)
        if timestamp_ge:
            statement = statement.where(model.timestamp >= timestamp_ge)
        if timestamp_le:
            statement = statement.where(model.timestamp <= timestamp_le)
        if search:
            statement = filter_query_by_search(search, statement, model.name)

        if amount_ge:
            if is_amount_abs:
                statement = statement.where(
                    func.abs(model.amount_default_currency) >= amount_ge
                )
            else:
                statement = statement.where(model.amount_default_currency >= amount_ge)
        if amount_le:
            if is_amount_abs:
                statement = statement.where(
                    func.abs(model.amount_default_currency) <= amount_le
                )
            else:
                statement = statement.where(model.amount_default_currency <= amount_le)

        # GROUP BY
        if consolidated:
            statement = statement.group_by(
                ConsolidatedTransaction.id,
                ConsolidatedTransaction.name,
                ConsolidatedTransaction.category_id,
                ConsolidatedTransaction.movement_id,
            )

        # ORDER BY
        order = desc if is_descending else asc
        statement = statement.order_by(order(model.timestamp), order(model.id))

        # OFFSET and LIMIT
        if per_page:
            offset = page * per_page
            statement = statement.offset(offset).limit(per_page)

        return statement

    @classmethod
    def read_many(
        cls, db: Session, consolidated: bool = False, **kwargs: Any
    ) -> Iterable[TransactionApiOut | MovementApiOut]:
        statement = cls.select(consolidated=consolidated, **kwargs)
        schema = MovementApiOut if consolidated else TransactionApiOut
        for transaction in db.execute(statement):
            logger.error(transaction._asdict())
            yield schema.model_validate(transaction)

    @classmethod
    def read(
        cls, db: Session, id: int, consolidated: bool = False, **kwargs: Any
    ) -> TransactionApiOut | MovementApiOut:
        statement = cls.select(id=id, **kwargs)
        transaction = db.execute(statement)
        schema = MovementApiOut if consolidated else TransactionApiOut
        return schema.model_validate(transaction)
