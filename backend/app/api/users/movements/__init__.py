from typing import Iterable
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, HTTPException, status

from app.database.deps import DBSession
from app.common.models import CurrencyCode

from app.features.user import CurrentUser, CRUDUser
from app.features.account import CRUDAccount, ForbiddenAccount
from app.features.transaction import (
    TransactionApiIn,
    CRUDTransaction,
)

from app.features.movement import (
    MovementApiOut,
    PLStatement,
    MovementField,
    CRUDMovement,
)

from .utils import check_user

from . import transactions


router = APIRouter()


@router.get("/aggregates/{start_date}/{end_date}")
def get_aggregate(
    db: DBSession,
    current_user: CurrentUser,
    start_date: date,
    end_date: date,
    currency_code: CurrencyCode,
) -> PLStatement:
    return CRUDUser.get_movement_aggregate(
        db,
        current_user.id,
        start_date,
        end_date,
        currency_code,
    )


@router.get("/aggregates")
def get_many_aggregates(
    db: DBSession,
    current_user: CurrentUser,
    currency_code: CurrencyCode,
    page: int = 0,
    per_page: int = 12,
) -> Iterable[PLStatement]:
    return CRUDUser.get_many_movement_aggregates(
        db, current_user.id, page, per_page, currency_code
    )


@router.post("/")
def create(
    db: DBSession,
    current_user: CurrentUser,
    transactions: list[tuple[int, TransactionApiIn]],
    transaction_ids: list[tuple[int, int]],
) -> Iterable[MovementApiOut]:
    for account_id, transaction in transactions:
        user_id = CRUDAccount.read_user_id(db, account_id)
        if CRUDAccount.is_synced(db, account_id):
            raise HTTPException(status.HTTP_403_FORBIDDEN)
        if user_id != current_user.id:
            raise ForbiddenAccount()
        yield CRUDMovement.create(db, account_id, transaction)

    for acount_id, transaction_id in transaction_ids:
        transaction_out = CRUDTransaction.read(db, transaction_id)
        if CRUDTransaction.read_user_id(db, transaction_out.id) != current_user.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN)
        yield CRUDMovement.create(db, acount_id, transaction_id)


@router.get("/{movement_id}")
def read(db: DBSession, current_user: CurrentUser, movement_id: int) -> MovementApiOut:
    movement = CRUDMovement.read(db, movement_id)
    check_user(db, current_user.id, movement.id)
    return movement


@router.get("/")
def read_many(
    db: DBSession,
    current_user: CurrentUser,
    account_id: int = 0,
    page: int = 0,
    per_page: int = 0,
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
        current_user.id,
        account_id,
        page,
        per_page,
        start_date,
        end_date,
        search,
        amount_gt,
        amount_lt,
        is_descending,
        sort_by,
    )


@router.delete("/{movement_id}")
def delete(db: DBSession, current_user: CurrentUser, id: int) -> None:
    check_user(db, current_user.id, id)
    CRUDMovement.delete(db, id)


router.include_router(
    transactions.router,
    prefix="/{movement_id}/transactions",
    tags=["transactions"],
)
