from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import NoResultFound

from app.features.user.deps import CurrentUser
from app.database.deps import DBSession


from .crud import CRUDTransaction
from .models import TransactionRead, TransactionWrite

from app.features.account.crud import CRUDAccount

router = APIRouter()


@router.post("/")
def create(
    db: DBSession,
    current_user: CurrentUser,
    transaction: TransactionWrite,
) -> TransactionRead:
    try:
        user = CRUDAccount.read_user(db, transaction.account_id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return CRUDTransaction.create(db, transaction)


@router.get("/{id}")
def read(db: DBSession, current_user: CurrentUser, id: int) -> TransactionRead:
    try:
        transaction = CRUDTransaction.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if CRUDTransaction.read_user(db, transaction.id).id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return transaction


@router.get("/")
def read_many(db: DBSession, current_user: CurrentUser) -> list[TransactionRead]:
    return CRUDTransaction.read_many_by_user(db, current_user.id)


@router.put("/{id}")
def update(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    transaction: TransactionWrite,
) -> TransactionRead:
    try:
        user = CRUDTransaction.read_user(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    try:
        user = CRUDAccount.read_user(db, transaction.account_id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return CRUDTransaction.update(db, id, transaction)


@router.delete("/{id}")
def delete(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
) -> None:
    try:
        user = CRUDTransaction.read_user(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return CRUDTransaction.delete(db, id)
