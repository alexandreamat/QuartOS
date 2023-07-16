from decimal import Decimal

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
    def read_user_id(cls, db: Session, id: int) -> int:
        return cls.db_model.read(db, id).user.id

    @classmethod
    def is_synced(cls, db: Session, id: int) -> bool:
        return cls.db_model.read(db, id).is_synced


class CRUDSyncableTransaction(
    CRUDSyncedBase[Transaction, TransactionPlaidOut, TransactionPlaidIn],
):
    db_model = Transaction
    out_model = TransactionPlaidOut
