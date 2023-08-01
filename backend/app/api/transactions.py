from fastapi import APIRouter

from app.database.deps import DBSession

from app.features.user import CurrentSuperuser
from app.features.transaction import (
    CRUDSyncableTransaction,
    TransactionPlaidIn,
    TransactionPlaidOut,
)

router = APIRouter()


@router.get("/plaid/{id}")
def read_plaid(db: DBSession, me: CurrentSuperuser, id: int) -> TransactionPlaidOut:
    return CRUDSyncableTransaction.read(db, id)


@router.put("/plaid/{id}")
def update_plaid(
    db: DBSession,
    me: CurrentSuperuser,
    id: int,
    transaction_in: TransactionPlaidIn,
) -> TransactionPlaidOut:
    return CRUDSyncableTransaction.update(db, id, transaction_in)
