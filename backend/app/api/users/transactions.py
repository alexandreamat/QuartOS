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
from app.crud.consolidatedtransaction import CRUDConsolidatedTransaction

from app.crud.movement import CRUDMovement
from app.crud.transaction import CRUDTransaction
from app.database.deps import DBSession
from app.deps.user import CurrentUser
from app.schemas.movement import MovementApiIn, MovementApiOut
from app.schemas.transaction import (
    TransactionApiOut,
)

router = APIRouter()


@router.get("/")
def read_many(
    db: DBSession,
    me: CurrentUser,
    account_id: int | None = None,
    category_id: int | None = None,
    page: int = 0,
    per_page: int = 0,
    timestamp__ge: date | None = None,
    timestamp__le: date | None = None,
    search: str | None = None,
    amount__ge: Decimal | None = None,
    amount__le: Decimal | None = None,
    amount__gt: Decimal | None = None,
    amount__lt: Decimal | None = None,
    is_amount_abs: bool = False,
    consolidated: bool = False,
    order_by: str | None = None,
) -> Iterable[TransactionApiOut | MovementApiOut]:
    return CRUDConsolidatedTransaction.read_many(
        db,
        user_id=me.id,
        account_id=account_id,
        category_id=category_id,
        page=page,
        per_page=per_page,
        search=search,
        timestamp__ge=timestamp__ge,
        timestamp__le=timestamp__le,
        amount__ge=amount__ge,
        amount__le=amount__le,
        amount__gt=amount__gt,
        amount__lt=amount__lt,
        order_by=order_by,
        is_amount_abs=is_amount_abs,
        consolidated=consolidated,
    )


@router.post("/")
def consolidate(
    db: DBSession,
    me: CurrentUser,
    transaction_ids: list[int],
) -> MovementApiOut:
    max_amount = Decimal("0")
    for transaction_id in transaction_ids:
        transaction_out = CRUDTransaction.read(db, transaction_id, user_id=me.id)
        amount = abs(transaction_out.amount)
        if amount > max_amount:
            max_amount = amount
            name = transaction_out.name
    movement_in = MovementApiIn(name=name)
    movement_out = CRUDMovement.create(db, movement_in, transaction_ids=transaction_ids)
    return MovementApiOut.model_validate(movement_out)
