from fastapi import APIRouter

from app.database.deps import DBSession

from app.features.user import CurrentSuperuser
from app.features.transaction import (
    CRUDTransaction,
    CRUDSyncableTransaction,
    TransactionApiOut,
    TransactionPlaidIn,
    TransactionPlaidOut,
    reset_transaction_to_metadata,
)

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
