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
from typing import Any

from pydantic import BaseModel

from app.schemas.account import AnnotatedLiteral
from app.schemas.common import ApiInMixin, ApiOutMixin


class PLStatementApiOut(BaseModel):
    timestamp__ge: date
    timestamp__lt: date
    income: Decimal
    expenses: Decimal


class DetailedPLStatementApiOut(PLStatementApiOut):
    income_by_category: dict[int, Decimal]
    expenses_by_category: dict[int, Decimal]


class __TransactionGroupBase(BaseModel):
    name: str
    category_id: int | None = None


class TransactionGroupApiOut(__TransactionGroupBase, ApiOutMixin):
    timestamp: date
    transactions_count: int
    amount_default_currency: Decimal
    category_id: int | None
    amount: Decimal | None
    # account_balance: Decimal | None
    account_id: int | None
    consolidated: AnnotatedLiteral(True)

    @classmethod
    def model_validate(cls, obj: Any, **kwargs: Any) -> "TransactionGroupApiOut":
        if hasattr(obj, "_asdict"):
            transaction_dict: dict[str, Any] = obj._asdict()
            return cls(**transaction_dict, consolidated=True)
        return super().model_validate(obj, **kwargs)


class TransactionGroupApiIn(__TransactionGroupBase, ApiInMixin): ...
