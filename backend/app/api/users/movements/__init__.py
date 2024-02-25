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

from app.crud.movement import CRUDMovement
from app.crud.user import CRUDUser
from app.database.deps import DBSession
from app.deps.user import CurrentUser
from app.schemas.movement import MovementApiIn, MovementApiOut, MovementField
from app.utils import include_package_routes

router = APIRouter()


@router.post("/merge")
def merge(db: DBSession, me: CurrentUser, movement_ids: list[int]) -> MovementApiOut:
    for movement_id in movement_ids:
        CRUDMovement.read(db, movement_id, user_id=me.id)
    return CRUDMovement.merge(db, movement_ids)


@router.get("/")
def read_many(
    db: DBSession, me: CurrentUser, page: int = 0, per_page: int = 20
) -> Iterable[MovementApiOut]:
    return CRUDMovement.read_many(db, user_id=me.id, page=page, per_page=per_page)


@router.get("/{movement_id}")
def read(
    db: DBSession,
    me: CurrentUser,
    movement_id: int,
) -> MovementApiOut:
    return CRUDMovement.read(db, movement_id, user_id=me.id)


@router.put("/")
def update_all(db: DBSession, me: CurrentUser) -> None:
    CRUDMovement.update_all(db, user_id=me.id)


@router.put("/{movement_id}")
def update(
    db: DBSession,
    me: CurrentUser,
    movement_id: int,
    movement_in: MovementApiIn,
) -> MovementApiOut:
    CRUDMovement.read(db, movement_id, user_id=me.id)
    return CRUDUser.update_movement(db, me.id, movement_id, movement_in)


@router.delete("/{movement_id}")
def delete(
    db: DBSession,
    me: CurrentUser,
    movement_id: int,
) -> int:
    CRUDMovement.read(db, movement_id, user_id=me.id)
    return CRUDMovement.delete(db, movement_id)


include_package_routes(router, __name__, __path__, "/{movement_id}")
