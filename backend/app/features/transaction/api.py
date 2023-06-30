from datetime import datetime
from typing import Iterable

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import NoResultFound

from app.features.user.deps import CurrentUser
from app.database.deps import DBSession


from .crud import CRUDTransaction
from .models import TransactionApiOut, TransactionApiIn

from app.features import account

router = APIRouter()


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
    is_descending: bool = True,
) -> Iterable[TransactionApiOut]:
    return CRUDTransaction.read_many_by_user(
        db, current_user.id, page, per_page, search, timestamp, is_descending
    )
