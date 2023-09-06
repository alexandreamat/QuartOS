from sqlmodel import Session

from app.common.crud import CRUDBase, CRUDSyncedBase


from .models import (
    Transaction,
    TransactionApiOut,
    TransactionApiIn,
    TransactionPlaidIn,
    TransactionPlaidOut,
)


class CRUDTransaction(CRUDBase[Transaction, TransactionApiOut, TransactionApiIn]):
    db_model = Transaction
    out_model = TransactionApiOut

    @classmethod
    def is_synced(cls, db: Session, transaction_id: int) -> bool:
        return Transaction.read(db, transaction_id).is_synced


class CRUDSyncableTransaction(
    CRUDSyncedBase[Transaction, TransactionPlaidOut, TransactionPlaidIn],
):
    db_model = Transaction
    out_model = TransactionPlaidOut
