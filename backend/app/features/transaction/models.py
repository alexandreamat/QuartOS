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
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, asc, desc, Select, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql.expression import ClauseElement

from app.common.models import SyncableBase
from app.common.utils import filter_query_by_search
from app.features.category import Category
from app.features.file import File

if TYPE_CHECKING:
    from app.features.userinstitutionlink import UserInstitutionLink  # noqa
    from app.features.institution import Institution  # noqa
    from app.features.user import User
    from app.features.account import Account
    from app.features.movement import Movement


class Transaction(SyncableBase):
    __tablename__ = "transaction"
    amount: Mapped[Decimal]
    timestamp: Mapped[date]
    name: Mapped[str]
    account_id: Mapped[int] = mapped_column(ForeignKey("account.id"))
    movement_id: Mapped[int] = mapped_column(ForeignKey("movement.id"))
    category_id: Mapped[int | None] = mapped_column(ForeignKey("category.id"))
    amount_default_currency: Mapped[Decimal]
    account_balance: Mapped[Decimal]
    files: Mapped[list[File]] = relationship(
        back_populates="transaction",
        cascade="all, delete",
    )

    account: Mapped["Account"] = relationship(back_populates="transactions")
    movement: Mapped["Movement"] = relationship(back_populates="transactions")
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

    @property
    def user(self) -> "User":
        return self.account.user

    @property
    def institution(self) -> "Institution | None":
        return self.account.institution

    @property
    def userinstitutionlink(self) -> "UserInstitutionLink | None":
        return self.account.userinstitutionlink

    @property
    def is_synced(self) -> bool:
        return self.plaid_id != None

    @classmethod
    def get_timestamp_desc_clauses(cls) -> tuple[ClauseElement, ClauseElement]:
        return desc(cls.timestamp), desc(cls.id)

    @classmethod
    def get_timestamp_asc_clauses(cls) -> tuple[ClauseElement, ClauseElement]:
        return asc(cls.timestamp), asc(cls.id)

    @classmethod
    def select_transactions(
        cls,
        transaction_id: int | None,
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
    ) -> Select[tuple["Transaction"]]:
        # SELECT
        statement = Transaction.select()

        # WHERE
        if transaction_id is not None:
            statement = statement.where(Transaction.id == transaction_id)
        if timestamp_ge:
            statement = statement.where(Transaction.timestamp >= timestamp_ge)
        if timestamp_le:
            statement = statement.where(Transaction.timestamp <= timestamp_le)
        if search:
            statement = filter_query_by_search(search, statement, Transaction.name)

        if amount_ge:
            if is_amount_abs:
                statement = statement.where(func.abs(Transaction.amount) >= amount_ge)
            else:
                statement = statement.where(Transaction.amount >= amount_ge)
        if amount_le:
            if is_amount_abs:
                statement = statement.where(func.abs(Transaction.amount) <= amount_le)
            else:
                statement = statement.where(Transaction.amount <= amount_le)

        # ORDER BY
        order = desc if is_descending else asc
        statement = statement.order_by(order(cls.timestamp), order(cls.id))

        # OFFSET and LIMIT
        if per_page:
            offset = page * per_page
            statement = statement.offset(offset).limit(per_page)

        return statement
