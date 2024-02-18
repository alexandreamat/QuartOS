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
from typing import Iterable

from fastapi import APIRouter

from app.database.deps import DBSession
from app.features.movement import (
    MovementApiOut,
    MovementApiIn,
    MovementField,
    CRUDMovement,
)
from app.features.user import CurrentUser, CRUDUser
from app.utils import include_package_routes

router = APIRouter()


@router.post("/merge")
def merge(db: DBSession, me: CurrentUser, movement_ids: list[int]) -> MovementApiOut:
    for movement_id in movement_ids:
        CRUDUser.read_movement(db, me.id, movement_id)
    return CRUDMovement.merge(db, movement_ids)


@router.get("/")
def read_many(
    db: DBSession,
    me: CurrentUser,
    page: int = 0,
    per_page: int = 20,
    start_date: date | None = None,
    end_date: date | None = None,
    search: str | None = None,
    is_amount_abs: bool = False,
    transactions_ge: int | None = None,
    transactions_le: int | None = None,
    is_descending: bool = True,
    sort_by: MovementField = MovementField.TIMESTAMP,
    category_id: int | None = None,
    amount_gt: Decimal | None = None,
    amount_lt: Decimal | None = None,
    amount_ge: Decimal | None = None,
    amount_le: Decimal | None = None,
) -> Iterable[MovementApiOut]:
    return CRUDUser.read_movements(
        db,
        me.id,
        category_id=category_id,
        page=page,
        per_page=per_page,
        start_date=start_date,
        end_date=end_date,
        search=search,
        is_descending=is_descending,
        transactions_ge=transactions_ge,
        transactions_le=transactions_le,
        order_by=sort_by,
        is_amount_abs=is_amount_abs,
        amount_gt=amount_gt,
        amount_lt=amount_lt,
        amount_ge=amount_ge,
        amount_le=amount_le,
    )


@router.get("/{movement_id}")
def read(
    db: DBSession,
    me: CurrentUser,
    movement_id: int,
) -> MovementApiOut:
    return CRUDUser.read_movement(db, me.id, movement_id)


@router.put("/")
def update_all(db: DBSession, me: CurrentUser) -> None:
    CRUDUser.update_all_movements(db, me.id)


@router.put("/{movement_id}")
def update(
    db: DBSession,
    me: CurrentUser,
    movement_id: int,
    movement_in: MovementApiIn,
) -> MovementApiOut:
    CRUDUser.read_movement(db, me.id, movement_id)
    return CRUDUser.update_movement(db, me.id, movement_id, movement_in)


@router.delete("/{movement_id}")
def delete(
    db: DBSession,
    me: CurrentUser,
    movement_id: int,
) -> int:
    CRUDUser.read_movement(db, me.id, movement_id)
    return CRUDMovement.delete(db, movement_id)


include_package_routes(router, __name__, __path__, "/{movement_id}")
