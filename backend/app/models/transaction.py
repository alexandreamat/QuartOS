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

import logging
from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING, Any

from sqlalchemy import ForeignKey, asc, desc
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql.expression import ClauseElement

from app.models.category import Category
from app.models.common import SyncableBase
from app.models.file import File

if TYPE_CHECKING:
    from app.models.transactiongroup import TransactionGroup
    from app.models.account import Account

logger = logging.getLogger(__name__)


class Transaction(SyncableBase):
    __tablename__ = "transaction"
    amount: Mapped[Decimal]
    timestamp: Mapped[date]
    name: Mapped[str]
    account_id: Mapped[int] = mapped_column(ForeignKey("account.id"))
    transaction_group_id: Mapped[int | None] = mapped_column(
        ForeignKey("transaction_group.id"), nullable=True
    )
    category_id: Mapped[int | None] = mapped_column(ForeignKey("category.id"))
    amount_default_currency: Mapped[Decimal]
    account_balance: Mapped[Decimal]
    files: Mapped[list[File]] = relationship(
        back_populates="transaction",
        cascade="all, delete",
    )

    account: Mapped["Account"] = relationship(back_populates="transactions")
    transaction_group: Mapped["TransactionGroup | None"] = relationship(
        back_populates="transactions"
    )
    category: Mapped[Category | None] = relationship()

    consolidated = False
    transactions_count = 1

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
