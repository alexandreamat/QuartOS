from typing import Iterable
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, HTTPException, status

from app.database.deps import DBSession
from app.common.models import CurrencyCode
from app.api import api_router

from app.features.user import CurrentUser, CRUDUser
from app.features.account import CRUDAccount, ForbiddenAccount
from app.features.transaction import (
    TransactionApiOut,
    TransactionApiIn,
    CRUDTransaction,
    api,
)

from .models import MovementApiOut, PLStatement, MovementField
from .crud import CRUDMovement

MOVEMENTS = "movements"
TRANSACTIONS = api.TRANSACTIONS

router = APIRouter()


def check_user(
    db: DBSession,
    user_id: int,
    movement_id: int,
) -> None:
    if not any(uid == user_id for uid in CRUDMovement.read_user_ids(db, movement_id)):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "The requested movement does not belong to the user",
        )


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


@router.post("/{id}/transactions", tags=[TRANSACTIONS])
def add_transaction(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    account_id: int,
    transaction: TransactionApiIn,
) -> MovementApiOut:
    return CRUDMovement.add_transaction(db, id, account_id, transaction)


@router.put("/{id}/transactions/{transaction_id}", tags=[TRANSACTIONS])
def update_transaction(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    transaction_id: int,
    account_id: int,
    transaction: TransactionApiIn,
) -> TransactionApiOut:
    # Check movement ownership
    check_user(db, current_user.id, id)

    # Check new account existence and ownership
    user_id = CRUDAccount.read_user_id(db, account_id)
    if user_id != current_user.id:
        raise ForbiddenAccount()

    return CRUDMovement.update_transaction(
        db, id, transaction_id, account_id, transaction
    )


@router.delete("/{id}/transactions/{transaction_id}", tags=[TRANSACTIONS])
def delete_transaction(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    account_id: int,
    transaction_id: int,
) -> None:
    check_user(db, current_user.id, id)
    if CRUDTransaction.is_synced(db, transaction_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)

    return CRUDMovement.delete_transaction(db, id, account_id, transaction_id)


@router.get("/{id}")
def read(db: DBSession, current_user: CurrentUser, id: int) -> MovementApiOut:
    movement = CRUDMovement.read(db, id)
    check_user(db, current_user.id, movement.id)
    return movement


@router.delete("/{id}", tags=[TRANSACTIONS])
def delete(db: DBSession, current_user: CurrentUser, id: int) -> None:
    check_user(db, current_user.id, id)
    CRUDMovement.delete(db, id)


@router.post("/", tags=[TRANSACTIONS])
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


api_router.include_router(router, prefix=f"/{MOVEMENTS}", tags=[MOVEMENTS])
