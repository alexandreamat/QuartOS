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
from enum import Enum

from pydantic import BaseModel

from app.common.schemas import ApiInMixin, ApiOutMixin


class PLStatement(BaseModel):
    start_date: date
    end_date: date
    income: Decimal
    expenses: Decimal


class DetailedPLStatementApiOut(PLStatement):
    income_by_category: dict[int, Decimal]
    expenses_by_category: dict[int, Decimal]


class __MovementBase(BaseModel):
    name: str
    category_id: int | None


class MovementField(str, Enum):
    TIMESTAMP = "timestamp"
    AMOUNT = "amount"


class MovementApiOut(__MovementBase, ApiOutMixin):
    timestamp: date | None
    transactions_count: int
    amount_default_currency: Decimal
    category_id: int | None


class MovementApiIn(__MovementBase, ApiInMixin):
    ...
