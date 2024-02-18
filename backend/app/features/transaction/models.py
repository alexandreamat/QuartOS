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

from asyncio import selector_events
from datetime import date
from decimal import Decimal
import logging
from typing import TYPE_CHECKING, Any

from sqlalchemy import (
    ColumnElement,
    ForeignKey,
    asc,
    desc,
    Select,
    distinct,
    func,
    select,
    case,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql.expression import ClauseElement

from app.common.models import SyncableBase
from app.common.utils import filter_query_by_search
from app.features.category import Category
from app.features.file import File
from app.features.movement import Movement

if TYPE_CHECKING:
    from app.features.account import Account


logger = logging.getLogger(__name__)


class Transaction(SyncableBase):
    __tablename__ = "transaction"
    amount: Mapped[Decimal]
    timestamp: Mapped[date]
    name: Mapped[str]
    account_id: Mapped[int] = mapped_column(ForeignKey("account.id"))
    movement_id: Mapped[int | None] = mapped_column(
        ForeignKey("movement.id"), nullable=True
    )
    category_id: Mapped[int | None] = mapped_column(ForeignKey("category.id"))
    amount_default_currency: Mapped[Decimal]
    account_balance: Mapped[Decimal]
    files: Mapped[list[File]] = relationship(
        back_populates="transaction",
        cascade="all, delete",
    )

    account: Mapped["Account"] = relationship(back_populates="transactions")
    movement: Mapped["Movement | None"] = relationship(back_populates="transactions")
    category: Mapped[Category | None] = relationship()

    @property
    def exchange_rate(self) -> Decimal:
        return self.amount / self.amount_default_currency

    @exchange_rate.setter
    def exchange_rate(self, value: Decimal) -> None:
        TWO_PACES = Decimal(10) ** -2
        amount_default_currency = self.amount * value
        self.amount_default_currency = amount_default_currency.quantize(TWO_PACES)

    @property
    def currency_code(self) -> str:
        return self.account.currency_code

    @classmethod
    def get_timestamp_desc_clauses(cls) -> tuple[ClauseElement, ClauseElement]:
        return desc(cls.timestamp), desc(cls.id)

    @classmethod
    def get_timestamp_asc_clauses(cls) -> tuple[ClauseElement, ClauseElement]:
        return asc(cls.timestamp), asc(cls.id)

    @classmethod
    def select_transactions(
        cls,
        transaction_id: int | None = None,
        *,
        page: int = 0,
        per_page: int = 0,
        search: str | None = None,
        timestamp_ge: date | None = None,
        timestamp_le: date | None = None,
        is_descending: bool = True,
        amount_ge: Decimal | None = None,
        amount_le: Decimal | None = None,
        is_amount_abs: bool = False,
        consolidated: bool = False,
    ) -> Select[tuple[Any, ...]]:

        model = ConsolidatedTransaction if consolidated else cls

        # SELECT
        if consolidated:

            from app.features.account import Account

            statement = select(
                ConsolidatedTransaction.id,
                ConsolidatedTransaction.timestamp,
                ConsolidatedTransaction.name,
                ConsolidatedTransaction.category_id,
                ConsolidatedTransaction.amount,
                ConsolidatedTransaction.amount_default_currency,
                ConsolidatedTransaction.account_id_max,
                ConsolidatedTransaction.account_id_min,
                ConsolidatedTransaction.transactions_count,
                ConsolidatedTransaction.movement_id,
                func.count(distinct(Account.currency_code)).label("currency_codes"),
            ).outerjoin(Movement)
        else:
            statement = select(
                Transaction.id,
                Transaction.timestamp,
                Transaction.name,
                Transaction.category_id,
                Transaction.amount,
                Transaction.amount_default_currency,
                Transaction.account_id,
                Transaction.movement_id,
                Transaction.account_balance,
                Transaction.is_synced,
            )

        # WHERE
        if transaction_id is not None:
            statement = statement.where(model.id == transaction_id)
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


class ConsolidatedTransactionMeta(type):
    def __getattribute__(cls, __name: str) -> Any:
        attr = super().__getattribute__(__name)
        return attr.label(__name)


class ConsolidatedTransaction(metaclass=ConsolidatedTransactionMeta):
    id = func.coalesce(-Movement.id, Transaction.id)
    name = func.coalesce(Movement.name, Transaction.name)
    category_id = func.coalesce(Movement.category_id, Transaction.category_id)
    timestamp = func.min(Transaction.timestamp)
    amount_default_currency = func.sum(Transaction.amount_default_currency)
    transactions_count = func.count(Transaction.id)
    account_id_max = func.max(Transaction.account_id)
    account_id_min = func.min(Transaction.account_id)
    movement_id = Movement.id
    amount = func.sum(Transaction.amount)
