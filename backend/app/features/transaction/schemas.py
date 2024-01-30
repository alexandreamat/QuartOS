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

from pydantic import BaseModel

from app.common.schemas import (
    PlaidInMixin,
    PlaidOutMixin,
    SyncableApiOutMixin,
    ApiInMixin,
)
from app.features.file import FileApiOut

if TYPE_CHECKING:
    pass


class __TransactionBase(BaseModel):
    amount: Decimal
    timestamp: date
    name: str
    category_id: int | None


class TransactionApiOut(__TransactionBase, SyncableApiOutMixin):
    account_balance: Decimal
    amount_default_currency: Decimal
    account_id: int
    movement_id: int
    files: list[FileApiOut]
    is_synced: bool


class TransactionApiIn(__TransactionBase, ApiInMixin):
    ...


class TransactionPlaidIn(TransactionApiIn, PlaidInMixin):
    ...


class TransactionPlaidOut(TransactionApiOut, PlaidOutMixin):
    ...
