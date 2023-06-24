from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import NoResultFound

from app.features.user.deps import CurrentUser
from app.database.deps import DBSession


from .crud import CRUDTransaction
from .models import TransactionApiOut, TransactionApiIn

from app.features.account.crud import CRUDAccount

router = APIRouter()


@router.post("/", tags=["accounts"])
def create(
    db: DBSession,
    current_user: CurrentUser,
    transactions: list[TransactionApiIn],
) -> list[TransactionApiOut]:
    results = []
    for transaction in transactions:
        try:
            user = CRUDAccount.read_user(db, transaction.account_id)
        except NoResultFound:
            raise HTTPException(status.HTTP_404_NOT_FOUND)
        if CRUDAccount.is_synced(db, transaction.account_id):
            raise HTTPException(status.HTTP_403_FORBIDDEN)
        if user.id != current_user.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN)
        results.append(CRUDTransaction.create(db, transaction))
    return results


@router.get("/{id}")
def read(db: DBSession, current_user: CurrentUser, id: int) -> TransactionApiOut:
    try:
        transaction = CRUDTransaction.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if CRUDTransaction.read_user(db, transaction.id).id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return transaction


@router.get("/")
def read_many(
    db: DBSession,
    current_user: CurrentUser,
    page: int = 1,
    per_page: int = 0,
    timestamp: datetime | None = None,
    search: str | None = None,
    ids: str | None = None,
    is_descending: bool = True,
) -> list[TransactionApiOut]:
    if ids:
        transactions = []
        for id in map(int, ids.split(",")):
            try:
                transaction = CRUDTransaction.read(db, id)
            except NoResultFound:
                raise HTTPException(status.HTTP_404_NOT_FOUND)
            if CRUDTransaction.read_user(db, transaction.id).id != current_user.id:
                raise HTTPException(status.HTTP_403_FORBIDDEN)
            transactions.append(transaction)
        return transactions
    return CRUDTransaction.read_many_by_user(
        db, current_user.id, page, per_page, search, timestamp, is_descending
    )


@router.put("/{id}", tags=["accounts"])
def update(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    transaction: TransactionApiIn,
) -> TransactionApiOut:
    try:
        user = CRUDTransaction.read_user(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    if CRUDTransaction.is_synced(db, id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    try:
        user = CRUDAccount.read_user(db, transaction.account_id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return CRUDTransaction.update(db, id, transaction)


@router.delete("/{id}", tags=["accounts"])
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
    if CRUDTransaction.is_synced(db, id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return CRUDTransaction.delete(db, id)
