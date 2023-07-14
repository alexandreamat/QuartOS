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
    def create(cls, db: Session, transaction_in: TransactionApiIn) -> TransactionApiOut:
        from app.features.account import CRUDAccount

        transaction_in.account_balance = Decimal(0)
        transaction_out = super().create(db, transaction_in)
        CRUDAccount.update_balance(
            db, transaction_out.account_id, transaction_out.timestamp
        )
        return transaction_out

    @classmethod
    def read_user_id(cls, db: Session, id: int) -> int:
        return cls.db_model.read(db, id).user.id

    @classmethod
    def update(
        cls, db: Session, id: int, transaction_in: TransactionApiIn
    ) -> TransactionApiOut:
        from app.features.account import CRUDAccount

        transaction_in.account_balance = Decimal(0)
        transaction_out = super().update(db, id, transaction_in)
        CRUDAccount.update_balance(
            db, transaction_out.account_id, transaction_out.timestamp
        )
        return transaction_out

    @classmethod
    def is_synced(cls, db: Session, id: int) -> bool:
        return cls.db_model.read(db, id).is_synced

    @classmethod
    def delete(cls, db: Session, id: int) -> None:
        from app.features.account import CRUDAccount

        transaction = cls.read(db, id)
        super().delete(db, id)
        CRUDAccount.update_balance(db, transaction.account_id, transaction.timestamp)


class CRUDSyncableTransaction(
    CRUDSyncedBase[Transaction, TransactionPlaidOut, TransactionPlaidIn],
):
    db_model = Transaction
    out_model = TransactionPlaidOut

    @classmethod
    def create(
        cls, db: Session, transaction_in: TransactionPlaidIn
    ) -> TransactionPlaidOut:
        from app.features.account import CRUDAccount

        if not transaction_in.plaid_metadata:
            assert 0, "missing plaid metadata"
        transaction_in.account_balance = Decimal(0)
        transaction_out = super().create(db, transaction_in)
        CRUDAccount.update_balance(
            db, transaction_out.account_id, transaction_out.timestamp
        )
        return transaction_out

    @classmethod
    def update(
        cls, db: Session, id: int, transaction_in: TransactionPlaidIn
    ) -> TransactionPlaidOut:
        from app.features.account import CRUDAccount

        if not transaction_in.plaid_metadata:
            assert 0, "missing plaid metadata"
        transaction_in.account_balance = Decimal(0)
        transaction_out = super().update(db, id, transaction_in)
        CRUDAccount.update_balance(
            db, transaction_out.account_id, transaction_out.timestamp
        )
        return transaction_out
