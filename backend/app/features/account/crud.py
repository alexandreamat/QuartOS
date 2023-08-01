from typing import Any

from datetime import date
from decimal import Decimal

from sqlmodel import Session

from app.common.crud import CRUDBase

from app.features.transactiondeserialiser import TransactionDeserialiserApiOut
from app.features.movement import (
    MovementApiOut,
    CRUDMovement,
)
from app.features.transaction import (
    TransactionApiOut,
    TransactionApiIn,
    TransactionPlaidIn,
    CRUDTransaction,
)

from .models import (
    Account,
    AccountApiOut,
    AccountApiIn,
    AccountPlaidIn,
    AccountPlaidOut,
)


class CRUDAccount(CRUDBase[Account, AccountApiOut, AccountApiIn]):
    db_model = Account
    out_model = AccountApiOut

    @classmethod
    def read_transaction_deserialiser(
        cls, db: Session, id: int
    ) -> TransactionDeserialiserApiOut:
        deserialiser = Account.read(db, id).transactiondeserialiser
        return TransactionDeserialiserApiOut.from_orm(deserialiser)

    @classmethod
    def sync(cls, db: Session, account: AccountPlaidIn) -> AccountPlaidOut:
        db_account_in = Account(**account.dict())
        db_account_out = Account.create(db, db_account_in)
        return AccountPlaidOut.from_orm(db_account_out)

    @classmethod
    def is_synced(cls, db: Session, id: int) -> bool:
        return Account.read(db, id).is_synced

    @classmethod
    def update(
        cls, db: Session, id: int, obj_in: AccountApiIn, **kwargs: Any
    ) -> AccountApiOut:
        super().update(db, id, obj_in, **kwargs)
        return cls.update_balance(db, id)

    @classmethod
    def update_balance(
        cls,
        db: Session,
        id: int,
        timestamp: date | None = None,
    ) -> AccountApiOut:
        account_out = Account.update_balance(db, id, timestamp)
        return AccountApiOut.from_orm(account_out)

    @classmethod
    def create_movement(
        cls,
        db: Session,
        account_id: int,
        transaction: TransactionApiIn | int,
    ) -> MovementApiOut:
        if isinstance(transaction, TransactionApiIn):
            transaction_in = transaction
            timestamp = transaction_in.timestamp
            movement_out = CRUDMovement.create(
                db, transaction_in, account_id=account_id, account_balance=Decimal(0)
            )

        else:
            transaction_id = transaction
            transaction_out = cls.read_transaction(db, account_id, None, transaction_id)
            timestamp = transaction_out.timestamp
            movement_out = CRUDMovement.create(
                db,
                transaction_id,
            )

        CRUDAccount.update_balance(db, account_id, timestamp)
        return movement_out

    @classmethod
    def create_movement_plaid(
        cls,
        db: Session,
        account_id: int,
        transaction_in: TransactionPlaidIn,
    ) -> MovementApiOut:
        movement_out = CRUDMovement.create_plaid(
            db, transaction_in, account_id=account_id, account_balance=Decimal(0)
        )
        CRUDAccount.update_balance(db, account_id, transaction_in.timestamp)
        return movement_out

    @classmethod
    def create_transaction(
        cls,
        db: Session,
        account_id: int,
        movement_id: int,
        transaction_in: TransactionApiIn,
    ) -> TransactionApiOut:
        transaction_out = CRUDMovement.create_transaction(
            db,
            movement_id,
            transaction_in,
            account_id=account_id,
            account_balance=Decimal(0),
        )
        cls.update_balance(db, account_id, transaction_in.timestamp)
        return transaction_out

    @classmethod
    def update_transaction(
        cls,
        db: Session,
        account_id: int,
        movement_id: int,
        transaction_id: int,
        transaction_in: TransactionApiIn,
        new_movement_id: int,
    ) -> TransactionApiOut:
        cls.read_transaction(db, account_id, movement_id, transaction_id)
        transaction_out = CRUDMovement.update_transaction(
            db,
            movement_id,
            transaction_id,
            transaction_in,
            new_movement_id,
            account_id=account_id,
            account_balance=Decimal(0),
        )
        CRUDAccount.update_balance(db, account_id, transaction_in.timestamp)
        return transaction_out

    @classmethod
    def delete_transaction(
        cls, db: Session, movement_id: int, account_id: int, transaction_id: int
    ) -> None:
        transaction_out = cls.read_transaction(
            db, account_id, movement_id, transaction_id
        )
        CRUDMovement.delete_transaction(db, movement_id, transaction_id)
        Account.update_balance(db, account_id, transaction_out.timestamp)

    @classmethod
    def read_transaction(
        cls,
        db: Session,
        account_id: int | None,
        movement_id: int | None,
        transaction_id: int,
    ) -> TransactionApiOut:
        statement = Account.select_transactions(account_id, movement_id, transaction_id)
        transaction = db.exec(statement).one()
        return TransactionApiOut.from_orm(transaction)
