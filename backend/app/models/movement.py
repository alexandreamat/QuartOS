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
from typing import TYPE_CHECKING, Any

from sqlalchemy import ForeignKey
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session

from app.crud.merchant import CRUDMerchant
from app.models.category import Category
from app.models.common import Base
from app.models.merchant import Merchant

if TYPE_CHECKING:
    from app.models.transaction import Transaction


class Movement(Base):
    __tablename__ = "movement"
    name: Mapped[str]
    transactions: Mapped[list["Transaction"]] = relationship(
        back_populates="movement", lazy="selectin"
    )
    category_id: Mapped[int | None] = mapped_column(ForeignKey("category.id"))
    merchant_id: Mapped[int | None] = mapped_column(ForeignKey("merchant.id"))

    category: Mapped[Category | None] = relationship(lazy="selectin")
    merchant: Mapped[Merchant | None] = relationship(lazy="selectin")

    @hybrid_property
    def timestamp(self) -> date:
        return min(t.timestamp for t in self.transactions)

    @hybrid_property
    def amount_default_currency(self) -> Decimal:
        return sum(
            [t.amount_default_currency for t in self.transactions],
            Decimal(0),
        )

    @hybrid_property
    def transactions_count(self) -> int:
        return len(self.transactions)

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
        # TODO: limit to user-defined merchants
        for merchant in CRUDMerchant.read_many(db):
            if re.compile(merchant.pattern).search(self.name):
                return merchant.id
        else:
            return None
