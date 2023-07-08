from typing import Iterable
from datetime import date

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import NoResultFound

from app.database.deps import DBSession
from app.common.models import CurrencyCode
from app.api import api_router

from app.features.user.deps import CurrentUser
from app.features.account import CRUDAccount, AccountNotFound, ForbiddenAccount  # type: ignore[attr-defined]
from app.features.transaction import (  # type: ignore[attr-defined]
    TransactionApiOut,
    TransactionApiIn,
    CRUDTransaction,
    TRANSACTIONS,
)

from .models import MovementApiOut, PLStatement
from .crud import CRUDMovement
from .exceptions import MovementNotFound

MOVEMENTS = "movements"

router = APIRouter()


def check_user(
    db: DBSession,
    user_id: int,
    movement_id: int,
) -> None:
    if not any(u.id == user_id for u in CRUDMovement.read_users(db, movement_id)):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "The requested movement does not belong to the user",
        )


@router.get("/aggregate/{start_date}/{end_date}")
def get_aggregate(
    db: DBSession,
    current_user: CurrentUser,
    start_date: date,
    end_date: date,
    currency_code: CurrencyCode,
) -> PLStatement:
    return CRUDMovement.get_aggregate(
        db, current_user.id, start_date, end_date, currency_code
    )


@router.post("/{id}/transactions", tags=[TRANSACTIONS])
def add_transaction(
    db: DBSession, current_user: CurrentUser, id: int, transaction: TransactionApiIn
) -> MovementApiOut:
    try:
        return CRUDMovement.add_transaction(db, id, transaction)
    except NoResultFound:
        raise MovementNotFound()


@router.put("/{id}/transactions/{transaction_id}", tags=[TRANSACTIONS])
def update_transaction(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    transaction_id: int,
    transaction: TransactionApiIn,
) -> TransactionApiOut:
    # Check movement ownership
    try:
        check_user(db, current_user.id, id)
    except NoResultFound:
        raise MovementNotFound()

    # Check new account existence and ownership
    try:
        user = CRUDAccount.read_user(db, transaction.account_id)
    except NoResultFound:
        raise AccountNotFound()
    if user.id != current_user.id:
        raise ForbiddenAccount()

    # Check new movement existence and ownership
    if not transaction.movement_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Movement ID not specified")
    try:
        check_user(db, current_user.id, transaction.movement_id)
    except NoResultFound:
        raise MovementNotFound()

    return CRUDMovement.update_transaction(db, id, transaction_id, transaction)


@router.delete("/{id}/transactions/{transaction_id}", tags=[TRANSACTIONS])
def delete_transaction(
    db: DBSession, current_user: CurrentUser, id: int, transaction_id: int
) -> None:
    try:
        check_user(db, current_user.id, id)
    except NoResultFound:
        raise MovementNotFound()
    if CRUDTransaction.is_synced(db, transaction_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)

    return CRUDMovement.delete_transaction(db, id, transaction_id)


@router.get("/{id}")
def read(db: DBSession, current_user: CurrentUser, id: int) -> MovementApiOut:
    try:
        movement = CRUDMovement.read(db, id)
    except NoResultFound:
        raise MovementNotFound()
    check_user(db, current_user.id, movement.id)
    return movement


@router.delete("/{id}", tags=[TRANSACTIONS])
def delete(db: DBSession, current_user: CurrentUser, id: int) -> None:
    try:
        check_user(db, current_user.id, id)
    except NoResultFound:
        raise MovementNotFound()
    CRUDMovement.delete(db, id)


@router.post("/", tags=[TRANSACTIONS])
def create(
    db: DBSession,
    current_user: CurrentUser,
    transactions: list[TransactionApiIn],
    transaction_ids: list[int],
) -> Iterable[MovementApiOut]:
    for transaction in transactions:
        try:
            user = CRUDAccount.read_user(db, transaction.account_id)
        except NoResultFound:
            raise AccountNotFound()
        if CRUDAccount.is_synced(db, transaction.account_id):
            raise HTTPException(status.HTTP_403_FORBIDDEN)
        if user.id != current_user.id:
            raise ForbiddenAccount()
        yield CRUDMovement.create(db, transaction)

    for transaction_id in transaction_ids:
        try:
            transaction_out = CRUDTransaction.read(db, transaction_id)
        except NoResultFound:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Transaction not found")
        if CRUDAccount.is_synced(db, transaction_out.account_id):
            raise HTTPException(status.HTTP_403_FORBIDDEN)
        if CRUDTransaction.read_user(db, transaction_out.id).id != current_user.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN)
        yield CRUDMovement.create(db, transaction_id)


@router.get("/")
def read_many(
    db: DBSession,
    current_user: CurrentUser,
    page: int = 1,
    per_page: int = 0,
    search: str | None = None,
) -> Iterable[MovementApiOut]:
    return CRUDMovement.read_many_by_user(db, current_user.id, page, per_page, search)


api_router.include_router(router, prefix=f"/{MOVEMENTS}", tags=[MOVEMENTS])
