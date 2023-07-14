from datetime import date
from typing import Iterable

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import NoResultFound

from app.database.deps import DBSession
from app.api import api_router

from app.features.user.deps import CurrentUser
from app.features.user import CRUDUser

from .crud import CRUDTransaction
from .models import TransactionApiOut

TRANSACTIONS = "transactions"

router = APIRouter()


@router.get("/{id}")
def read(db: DBSession, current_user: CurrentUser, id: int) -> TransactionApiOut:
    try:
        transaction = CRUDTransaction.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if CRUDTransaction.read_user_id(db, transaction.id) != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return transaction


@router.get("/")
def read_many(
    db: DBSession,
    current_user: CurrentUser,
    page: int = 1,
    per_page: int = 0,
    timestamp: date | None = None,
    search: str | None = None,
    is_descending: bool = True,
) -> Iterable[TransactionApiOut]:
    return CRUDUser.read_transactions(
        db, current_user.id, 0, page, per_page, search, timestamp, is_descending
    )


api_router.include_router(router, prefix=f"/{TRANSACTIONS}", tags=[TRANSACTIONS])
