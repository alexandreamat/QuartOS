from typing import Iterable
from datetime import date
from decimal import Decimal

from fastapi import APIRouter

from app.database.deps import DBSession

from app.features.user import CurrentUser, CRUDUser
from app.features.movement import (
    MovementApiOut,
    MovementApiIn,
    MovementField,
    CRUDMovement,
)

from . import aggregates

router = APIRouter()


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
    amount_gt: Decimal | None = None,
    amount_lt: Decimal | None = None,
    is_descending: bool = True,
    sort_by: MovementField = MovementField.TIMESTAMP,
) -> Iterable[MovementApiOut]:
    return CRUDUser.read_movements(
        db,
        me.id,
        userinstitutionlink_id,
        account_id,
        page=page,
        per_page=per_page,
        start_date=start_date,
        end_date=end_date,
        search=search,
        is_descending=is_descending,
        sort_by=sort_by,
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
    return CRUDMovement.update(db, movement_id, movement_in)


@router.delete("/{movement_id}")
def delete(
    db: DBSession,
    me: CurrentUser,
    movement_id: int,
) -> None:
    CRUDUser.read_movement(db, me.id, None, None, movement_id)
    CRUDMovement.delete(db, movement_id)


router.include_router(aggregates.router, prefix="/aggregates")
