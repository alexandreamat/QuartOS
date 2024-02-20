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

from typing import Iterable

from fastapi import APIRouter

from app.crud.movement import CRUDMovement
from app.crud.transaction import CRUDTransaction
from app.database.deps import DBSession
from app.deps.user import CurrentUser
from app.schemas.movement import MovementApiOut
from app.schemas.transaction import TransactionApiOut

router = APIRouter()


@router.get("/")
def read_many(
    db: DBSession, me: CurrentUser, movement_id: int
) -> Iterable[TransactionApiOut]:
    return CRUDTransaction.read_many(
        db, user_id=me.id, consolidated=False, movement_id=movement_id
    )


@router.put("/")
def add(
    db: DBSession,
    me: CurrentUser,
    movement_id: int,
    transaction_ids: list[int],
) -> MovementApiOut:
    CRUDMovement.read(db, movement_id, user_id=me.id)
    for transaction_id in transaction_ids:
        CRUDTransaction.read(db, transaction_id, user_id=me.id)
    return CRUDMovement.add_transactions(db, movement_id, transaction_ids)


@router.delete("/{transaction_id}")
def remove(
    db: DBSession, me: CurrentUser, movement_id: int, transaction_id: int
) -> MovementApiOut | None:
    CRUDTransaction.read(db, transaction_id, user_id=me.id, movement_id=movement_id)
    return CRUDMovement.remove_transaction(db, movement_id, transaction_id)
