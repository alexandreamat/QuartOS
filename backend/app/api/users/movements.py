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

router = APIRouter()


@router.post("/")
def create(
    db: DBSession,
    me: CurrentUser,
    transaction_ids: list[int],
) -> MovementApiOut:
    for transaction_id in transaction_ids:
        CRUDUser.read_transaction(db, me.id, None, None, None, transaction_id)
    return CRUDMovement.create(db, transaction_ids)


@router.get("/")
def read_many(
    db: DBSession,
    me: CurrentUser,
    userinstitutionlink_id: int | None = None,
    account_id: int | None = None,
    page: int = 0,
    per_page: int = 20,
    start_date: date | None = None,
    end_date: date | None = None,
    search: str | None = None,
    transaction_amount_ge: Decimal | None = None,
    transaction_amount_le: Decimal | None = None,
    is_amount_abs: bool = False,
    transactionsGe: int | None = None,
    transactionsLe: int | None = None,
    is_descending: bool = True,
    sort_by: MovementField = MovementField.TIMESTAMP,
    category_id: int | None = None,
    amount_gt: Decimal | None = None,
    amount_lt: Decimal | None = None,
) -> Iterable[MovementApiOut]:
    return CRUDUser.read_movements(
        db,
        me.id,
        userinstitutionlink_id,
        account_id,
        category_id=category_id,
        page=page,
        per_page=per_page,
        start_date=start_date,
        end_date=end_date,
        search=search,
        is_descending=is_descending,
        transactionsGe=transactionsGe,
        transactionsLe=transactionsLe,
        sort_by=sort_by,
        transaction_amount_ge=transaction_amount_ge,
        transaction_amount_le=transaction_amount_le,
        is_amount_abs=is_amount_abs,
        amount_gt=amount_gt,
        amount_lt=amount_lt,
    )


@router.get("/{movement_id}")
def read(
    db: DBSession,
    me: CurrentUser,
    movement_id: int,
) -> MovementApiOut:
    return CRUDUser.read_movement(db, me.id, None, None, movement_id)


@router.put("/{movement_id}")
def update(
    db: DBSession,
    me: CurrentUser,
    movement_id: int,
    movement_in: MovementApiIn,
) -> MovementApiOut:
    CRUDUser.read_movement(db, me.id, None, None, movement_id)
    return CRUDUser.update_movement(db, me.id, movement_id, movement_in)


@router.put("/{movement_id}/transactions/")
def add_transactions(
    db: DBSession,
    me: CurrentUser,
    movement_id: int,
    transaction_ids: list[int],
) -> MovementApiOut:
    CRUDUser.read_movement(db, me.id, None, None, movement_id)
    for transaction_id in transaction_ids:
        CRUDUser.read_transaction(db, me.id, None, None, None, transaction_id)
    return CRUDMovement.add_transactions(db, movement_id, transaction_ids)


@router.delete("/{movement_id}")
def delete(
    db: DBSession,
    me: CurrentUser,
    movement_id: int,
) -> int:
    CRUDUser.read_movement(db, me.id, None, None, movement_id)
    return CRUDMovement.delete(db, movement_id)
