from datetime import date
from typing import Iterable

from fastapi import APIRouter, HTTPException, status

from app.database.deps import DBSession
from app.api import api_router

from app.features.user.deps import CurrentUser, CurrentSuperuser
from app.features.user import CRUDUser

from .crud import CRUDTransaction, CRUDSyncableTransaction
from .models import TransactionApiOut, TransactionPlaidIn, TransactionPlaidOut
from .plaid import reset_transaction_to_metadata

TRANSACTIONS = "transactions"

router = APIRouter()


@router.put("/plaid/{id}/reset")
def reset_plaid(
    db: DBSession, current_user: CurrentSuperuser, id: int
) -> TransactionApiOut:
    reset_transaction_to_metadata(db, id)
    return CRUDTransaction.read(db, id)


@router.get("/plaid/{id}")
def read_plaid(
    db: DBSession, current_user: CurrentSuperuser, id: int
) -> TransactionPlaidOut:
    return CRUDSyncableTransaction.read(db, id)


@router.put("/plaid/{id}")
def update_plaid(
    db: DBSession,
    current_user: CurrentSuperuser,
    id: int,
    transaction_in: TransactionPlaidIn,
) -> TransactionPlaidOut:
    return CRUDSyncableTransaction.update(db, id, transaction_in)


@router.get("/{id}")
def read(db: DBSession, current_user: CurrentUser, id: int) -> TransactionApiOut:
    transaction = CRUDTransaction.read(db, id)
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
