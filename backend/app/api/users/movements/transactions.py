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

from app.database.deps import DBSession
from app.features.movement.crud import CRUDMovement
from app.features.movement.schemas import MovementApiOut
from app.features.transaction import TransactionApiOut
from app.features.transaction.crud import CRUDTransaction
from app.features.user.crud import CRUDUser
from app.features.user.deps import CurrentUser

router = APIRouter()


@router.get("/")
def read_many(
    db: DBSession, me: CurrentUser, movement_id: int
) -> Iterable[TransactionApiOut]:
    return CRUDUser.read_transactions(db, me.id, movement_id=movement_id)


@router.put("/")
def add(
    db: DBSession,
    me: CurrentUser,
    movement_id: int,
    transaction_ids: list[int],
) -> MovementApiOut:
    CRUDUser.read_movement(db, me.id, movement_id)
    for transaction_id in transaction_ids:
        CRUDUser.read_transaction(db, me.id, transaction_id=transaction_id)
    return CRUDTransaction.add_transactions(db, movement_id, transaction_ids)


@router.delete("/{transaction_id}")
def remove(
    db: DBSession, me: CurrentUser, movement_id: int, transaction_id: int
) -> MovementApiOut | None:
    CRUDUser.read_transaction(db, me.id, transaction_id, movement_id=movement_id)
    return CRUDTransaction.remove_transaction(db, movement_id, transaction_id)
