from __future__ import annotations
from typing import Iterable

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import NoResultFound

from app.features.user.deps import CurrentUser
from app.database.deps import DBSession

from app.features import account

from .models import MovementApiOut
from .crud import CRUDMovement

# forward references, only for annotations
from app.features.transaction.models import TransactionApiOut, TransactionApiIn

router = APIRouter()


@router.post("/{id}/transactions", tags=["transactions"])
def add_transaction(
    db: DBSession, current_user: CurrentUser, id: int, transaction: TransactionApiIn
) -> MovementApiOut:
    try:
        return CRUDMovement.add_transaction(db, id, transaction)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Movement not found")


@router.get("/{id}/transactions")
def read_transactions(
    db: DBSession, current_user: CurrentUser, id: int
) -> Iterable[TransactionApiOut]:
    from app.features import transaction

    try:
        movement = CRUDMovement.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Movement not found")
    u = CRUDMovement.read_user(db, movement.id)
    if u.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return transaction.crud.CRUDTransaction.read_many_by_movement(db, id)


@router.put("/{id}/transactions/{transaction_id}", tags=["transactions"])
def update_transaction(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    transaction_id: int,
    transaction: TransactionApiIn,
) -> TransactionApiOut:
    from app.features.transaction.crud import CRUDTransaction

    # Check movement ownership
    try:
        user = CRUDMovement.read_user(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Movement not found")
    if user.id != current_user.id:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "New movement does not belong to the current user",
        )
    if CRUDTransaction.is_synced(db, transaction_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Transaction is synched")

    # Check new account existence and ownership
    try:
        user = account.crud.CRUDAccount.read_user(db, transaction.account_id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Account not found")
    if user.id != current_user.id:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN, "New account does not belong to the current user"
        )

    # Check new movement existence and ownership
    if not transaction.movement_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Movement ID not specified")
    try:
        user = CRUDMovement.read_user(db, transaction.movement_id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Movement not found")
    if user.id != current_user.id:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "New movement does not belong the the current user",
        )

    return CRUDMovement.update_transaction(db, id, transaction_id, transaction)


@router.delete("/{id}/transactions/{transaction_id}", tags=["transactions"])
def delete_transaction(
    db: DBSession, current_user: CurrentUser, id: int, transaction_id: int
) -> None:
    from app.features.transaction.crud import CRUDTransaction

    try:
        user = CRUDMovement.read_user(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Movement not found")
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    if CRUDTransaction.is_synced(db, transaction_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)

    return CRUDMovement.delete_transaction(db, id, transaction_id)


@router.get("/{id}")
def read(db: DBSession, current_user: CurrentUser, id: int) -> MovementApiOut:
    try:
        movement = CRUDMovement.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Movement not found")
    u = CRUDMovement.read_user(db, movement.id)
    if u.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return movement


@router.delete("/{id}", tags=["transactions"])
def delete(db: DBSession, current_user: CurrentUser, id: int) -> None:
    try:
        movement = CRUDMovement.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Movement not found")
    if CRUDMovement.read_user(db, movement.id).id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    CRUDMovement.delete(db, id)


@router.post("/", tags=["transactions"])
def create(
    db: DBSession,
    current_user: CurrentUser,
    transactions: list[TransactionApiIn],
    transaction_ids: list[int],
) -> Iterable[MovementApiOut]:
    from app.features.transaction.crud import CRUDTransaction

    for transaction in transactions:
        try:
            user = account.crud.CRUDAccount.read_user(db, transaction.account_id)
        except NoResultFound:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Account not found")
        if account.crud.CRUDAccount.is_synced(db, transaction.account_id):
            raise HTTPException(status.HTTP_403_FORBIDDEN)
        if user.id != current_user.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN)
        yield CRUDMovement.create(db, transaction)

    for transaction_id in transaction_ids:
        try:
            transaction_out = CRUDTransaction.read(db, transaction_id)
        except NoResultFound:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Transaction not found")
        if account.crud.CRUDAccount.is_synced(db, transaction_out.account_id):
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
) -> list[MovementApiOut]:
    return CRUDMovement.read_many_by_user(db, current_user.id, page, per_page, search)
