from typing import Iterable
from datetime import date

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import NoResultFound

from app.features.user.deps import CurrentUser
from app.database.deps import DBSession
from app.common.models import CurrencyCode

from app.features import account

from .models import MovementApiOut, PLStatement
from .crud import CRUDMovement

from app.features.transaction.models import TransactionApiOut, TransactionApiIn
from app.features.transaction.crud import CRUDTransaction

router = APIRouter()


@router.get("/aggregates/{start_date}/{end_date}")
def get_aggregate(
    db: DBSession,
    current_user: CurrentUser,
    start_date: date,
    end_date: date,
    currency_code: CurrencyCode,
) -> PLStatement:
    return CRUDMovement.get_aggregates(
        db, current_user.id, start_date, end_date, currency_code
    )


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
    try:
        movement = CRUDMovement.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Movement not found")
    if not any(
        u.id != current_user.id for u in CRUDMovement.read_users(db, movement.id)
    ):
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return CRUDMovement.read_transactions(db, id)


@router.put("/{id}/transactions/{transaction_id}", tags=["transactions"])
def update_transaction(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    transaction_id: int,
    transaction: TransactionApiIn,
) -> TransactionApiOut:
    # Check movement ownership
    try:
        users = CRUDMovement.read_users(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Movement not found")
    if not any(u.id != current_user.id for u in CRUDMovement.read_users(db, id)):
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
        users = CRUDMovement.read_users(db, transaction.movement_id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Movement not found")
    if not any(u.id != current_user.id for u in users):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "New movement does not belong the the current user",
        )

    return CRUDMovement.update_transaction(db, id, transaction_id, transaction)


@router.delete("/{id}/transactions/{transaction_id}", tags=["transactions"])
def delete_transaction(
    db: DBSession, current_user: CurrentUser, id: int, transaction_id: int
) -> None:
    try:
        users = CRUDMovement.read_users(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Movement not found")
    if not any(u.id != current_user.id for u in users):
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
    users = CRUDMovement.read_users(db, movement.id)
    if not any(u.id != current_user.id for u in users):
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return movement


@router.delete("/{id}", tags=["transactions"])
def delete(db: DBSession, current_user: CurrentUser, id: int) -> None:
    try:
        movement = CRUDMovement.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Movement not found")
    users = CRUDMovement.read_users(db, movement.id)
    if not any(u.id != current_user.id for u in users):
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    CRUDMovement.delete(db, id)


@router.post("/", tags=["transactions"])
def create(
    db: DBSession,
    current_user: CurrentUser,
    transactions: list[TransactionApiIn],
    transaction_ids: list[int],
) -> Iterable[MovementApiOut]:
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
) -> Iterable[MovementApiOut]:
    return CRUDMovement.read_many_by_user(db, current_user.id, page, per_page, search)
