# Copyright (C) 2023 Alexandre Amat
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

from decimal import Decimal
from datetime import date
from typing import Iterable

from fastapi import APIRouter

from app.database.deps import DBSession

from app.features.user import CurrentUser, CRUDUser
from app.features.transaction import TransactionApiOut

router = APIRouter()


@router.get("/")
def read_many(
    db: DBSession,
    me: CurrentUser,
    account_id: int | None = None,
    page: int = 0,
    per_page: int = 0,
    timestamp_ge: date | None = None,
    timestamp_le: date | None = None,
    search: str | None = None,
    is_descending: bool = True,
    amount_ge: Decimal | None = None,
    amount_le: Decimal | None = None,
    is_amount_abs: bool = False,
) -> Iterable[TransactionApiOut]:
    return CRUDUser.read_transactions(
        db,
        me.id,
        None,
        account_id,
        None,
        page=page,
        per_page=per_page,
        search=search,
        timestamp_ge=timestamp_ge,
        timestamp_le=timestamp_le,
        is_descending=is_descending,
        amount_ge=amount_ge,
        amount_le=amount_le,
        is_amount_abs=is_amount_abs,
    )
