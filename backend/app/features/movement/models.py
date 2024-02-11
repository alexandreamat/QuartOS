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


import re
from collections import defaultdict
from datetime import date
from decimal import Decimal
from typing import Any

from sqlalchemy import ForeignKey, Select, func, ColumnElement
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session

from app.common.models import Base
from app.features.category.models import Category
from app.features.merchant.crud import CRUDMerchant
from app.features.merchant.models import Merchant
from app.features.transaction import Transaction


class Movement(Base):
    __tablename__ = "movement"
    name: Mapped[str]
    transactions: Mapped[list[Transaction]] = relationship(
        back_populates="movement", cascade="all, delete", lazy="selectin"
    )
    category_id: Mapped[int | None] = mapped_column(ForeignKey("category.id"))
    merchant_id: Mapped[int | None] = mapped_column(ForeignKey("merchant.id"))

    category: Mapped[Category | None] = relationship(lazy="selectin")
    merchant: Mapped[Merchant | None] = relationship(lazy="selectin")

    @hybrid_property
    def timestamp(self) -> date:
        return min(t.timestamp for t in self.transactions)

    @timestamp.inplace.expression
    @classmethod
    def _timestamp_expression(cls) -> ColumnElement[date]:
        return func.min(Transaction.timestamp)

    @hybrid_property
    def amount_default_currency(self) -> Decimal:
        return sum(
            [t.amount_default_currency for t in self.transactions],
            Decimal(0),
        )

    @amount_default_currency.inplace.expression
    @classmethod
    def _amount_default_currency_expression(cls) -> ColumnElement[Decimal]:
        return func.sum(Transaction.amount_default_currency)

    @hybrid_property
    def transactions_count(self) -> int:
        return len(self.transactions)

    @transactions_count.inplace.expression
    def _transactions_count_expression(cls) -> ColumnElement[int]:
        return func.count(Transaction.id)

    @property
    def default_category_id_transactions(self) -> int | None:
        amounts: dict[int | None, Decimal] = defaultdict(Decimal)
        for t in self.transactions:
            if not t.category:
                continue
            amounts[t.category.id] += t.amount
        return max(amounts, key=lambda x: abs(amounts[x]), default=None)

    @property
    def default_category_id_merchant(self) -> int | None:
        if isinstance(self.merchant, Merchant):
            return self.merchant.default_category_id
        return None

    @property
    def default_category_id(self) -> int | None:
        return (
            self.default_category_id_merchant or self.default_category_id_transactions
        )

    @classmethod
    def select_transactions(
        cls, movement_id: int | None, *, transaction_id: int | None, **kwargs: Any
    ) -> Select[tuple[Transaction]]:
        statement = Transaction.select_transactions(transaction_id, **kwargs)

        statement = statement.join(cls)
        if movement_id:
            statement = statement.where(cls.id == movement_id)

        return statement

    @classmethod
    def update(cls, db: Session, id: int, **kwargs: Any) -> "Movement":
        m = super().update(db, id, **kwargs)
        if not m.merchant_id:
            m.merchant_id = m.get_merchant_id(db)
        if not m.category_id:
            m.category_id = m.default_category_id
        return m

    @classmethod
    def create(cls, db: Session, **kwargs: Any) -> "Movement":
        m = super().create(db, **kwargs)
        if not m.merchant_id:
            m.merchant_id = m.get_merchant_id(db)
        if not m.category_id:
            m.category_id = m.default_category_id
        return m

    def get_merchant_id(self, db: Session) -> int | None:
        for merchant in CRUDMerchant.read_many(db, 0, 0):
            if re.compile(merchant.pattern).search(self.name):
                return merchant.id
        else:
            return None
