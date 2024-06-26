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
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.category import Category
from app.models.common import SyncableBase
from app.models.file import File

if TYPE_CHECKING:
    from app.models.account import Account
    from app.models.transactiongroup import TransactionGroup
    from app.models.bucket import Bucket

logger = logging.getLogger(__name__)


class Transaction(SyncableBase):
    __tablename__ = "transaction"
    amount: Mapped[Decimal]
    timestamp: Mapped[date]
    name: Mapped[str]
    account_id: Mapped[int] = mapped_column(ForeignKey("account.id"))
    bucket_id: Mapped[int] = mapped_column(ForeignKey("bucket.id"))
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
    bucket: Mapped["Bucket"] = relationship(back_populates="transactions")
    transaction_group: Mapped["TransactionGroup | None"] = relationship(
        back_populates="transactions"
    )
    category: Mapped[Category | None] = relationship()

    is_group = False

    @property
    def exchange_rate(self) -> Decimal:
        return self.amount / self.amount_default_currency

    @exchange_rate.setter
    def exchange_rate(self, value: Decimal) -> None:
        TWO_PACES = Decimal(10) ** -2
        amount_default_currency = self.amount * value
        self.amount_default_currency = amount_default_currency.quantize(TWO_PACES)
