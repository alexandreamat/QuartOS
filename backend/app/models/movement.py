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

from sqlalchemy import ColumnElement, ForeignKey, distinct, func, case
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session

from app.crud.merchant import CRUDMerchant
from app.models.account import Account
from app.models.category import Category
from app.models.common import Base
from app.models.merchant import Merchant
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

    consolidated = True

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
    @classmethod
    def _transaction_count_expression(cls) -> ColumnElement[int]:
        return func.count(Transaction.id)

    @hybrid_property
    def account_id_max(self) -> int:
        return max((t.account_id for t in self.transactions), default=0)

    @account_id_max.inplace.expression
    @classmethod
    def _acount_id_max_expression(cls) -> ColumnElement[int]:
        return func.max(Transaction.account_id)

    @hybrid_property
    def account_id_min(self) -> int:
        return min((t.account_id for t in self.transactions), default=0)

    @account_id_min.inplace.expression
    @classmethod
    def _acount_id_min_expression(cls) -> ColumnElement[int]:
        return func.min(Transaction.account_id)

    @hybrid_property
    def account_id(self) -> int | None:
        if self.account_id_max == self.account_id_min:
            return self.account_id_max
        return None

    @account_id.inplace.expression
    @classmethod
    def _account_id_expression(cls) -> ColumnElement[int | None]:
        return case((cls.account_id_min == cls.account_id_max, cls.account_id_min))

    @hybrid_property
    def currency_codes(self) -> int:
        return len({t.account.currency_code for t in self.transactions})

    @currency_codes.inplace.expression
    @classmethod
    def _currency_codes_expression(cls) -> ColumnElement[int]:
        return func.count(distinct(Account.currency_code))

    @hybrid_property
    def amount(self) -> Decimal | None:
        if self.currency_codes == 1:
            return sum((t.amount for t in self.transactions), start=Decimal(0))
        return None

    @amount.inplace.expression
    @classmethod
    def _amount_expression(cls) -> ColumnElement[Decimal | None]:
        return case((cls.currency_codes == 1, func.sum(Transaction.amount)))

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
