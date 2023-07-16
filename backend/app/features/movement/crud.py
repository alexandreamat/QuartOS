from typing import Iterable
from decimal import Decimal

from sqlmodel import Session

from app.common.crud import CRUDBase

from app.features.transaction import (
    Transaction,
    TransactionApiIn,
    TransactionApiOut,
    TransactionPlaidIn,
    TransactionPlaidOut,
)

from account import Account
from .models import Movement, MovementApiIn, MovementApiOut


class CRUDMovement(CRUDBase[Movement, MovementApiOut, MovementApiIn]):
    db_model = Movement
    out_model = MovementApiOut

    @classmethod
    def create(  # type: ignore [override]
        cls,
        db: Session,
        account_id: int,
        transaction: TransactionApiIn | int,
    ) -> MovementApiOut:
        new_movement = Movement.create(db)

        if isinstance(transaction, TransactionApiIn):
            transaction_in = Transaction(
                account_id=account_id, movement_id=new_movement.id, **transaction.dict()
            )
            transaction_in.account_balance = Decimal(0)
            transaction_out = Transaction.create(db, transaction_in)
            Account.update_balance(db, account_id, transaction_out.timestamp)
        else:
            transaction_db = Transaction.read(db, transaction)
            old_movement = Movement.read(db, transaction_db.movement_id)
            transaction_db.movement_id = new_movement.id
            transaction_db.account_balance = Decimal(0)
            transaction_out = Transaction.update(db, transaction, transaction_db)
            Account.update_balance(db, account_id, transaction_out.timestamp)
            if not old_movement.transactions:
                Movement.delete(db, old_movement.id)

        return CRUDMovement.read(db, new_movement.id)

    @classmethod
    def create_syncable(
        cls, db: Session, account_id: int, transaction: TransactionPlaidIn
    ) -> MovementApiOut:
        movement = Movement.create(db)
        transaction_in = Transaction(
            movement_id=movement.id, account_id=account_id, **transaction.dict()
        )
        transaction_in.account_balance = Decimal(0)
        transaction_out = Transaction.create(db, transaction_in)
        Account.update_balance(db, account_id, transaction_out.timestamp)
        return CRUDMovement.read(db, movement.id)

    @classmethod
    def read_user_ids(cls, db: Session, id: int) -> Iterable[int]:
        for user in Movement.read(db, id).users:
            yield user.id

    @classmethod
    def add_transaction(
        cls, db: Session, id: int, account_id: int, transaction: TransactionApiIn
    ) -> MovementApiOut:
        transaction_in = Transaction(
            movement_id=id, account_id=account_id, **transaction.dict()
        )
        transaction_in.account_balance = Decimal(0)
        transaction_out = Transaction.create(db, transaction_in)
        Account.update_balance(db, account_id, transaction_out.timestamp)
        return CRUDMovement.read(db, id)

    @classmethod
    def read_transactions(
        cls, db: Session, movement_id: int
    ) -> Iterable[TransactionApiOut]:
        for t in Movement.read(db, movement_id).transactions:
            yield TransactionApiOut.from_orm(t)

    @classmethod
    def update_transaction(
        cls,
        db: Session,
        id: int,
        transaction_id: int,
        account_id: int,
        transaction: TransactionApiIn,
    ) -> TransactionApiOut:
        transaction_in = Transaction(
            movement_id=id, account_id=account_id, **transaction.dict()
        )
        transaction_in.account_balance = Decimal(0)
        transaction_out = Transaction.update(db, transaction_id, transaction_in)
        Account.update_balance(db, account_id, transaction_out.timestamp)
        return TransactionApiOut.from_orm(transaction_out)

    @classmethod
    def update_syncable(
        cls,
        db: Session,
        id: int,
        transaction_id: int,
        account_id: int,
        transaction: TransactionPlaidIn,
    ) -> TransactionPlaidOut:
        transaction_in = Transaction(
            movement_id=id, account_id=account_id, **transaction.dict()
        )
        transaction_in.account_balance = Decimal(0)
        transaction_out = Transaction.update(db, transaction_id, transaction_in)
        Account.update_balance(db, account_id, transaction_out.timestamp)
        return TransactionPlaidOut.from_orm(transaction_out)

    @classmethod
    def delete_transaction(
        cls, db: Session, id: int, account_id: int, transaction_id: int
    ) -> None:
        transaction = Transaction.read(db, transaction_id)
        Transaction.delete(db, transaction_id)
        Account.update_balance(db, account_id, transaction.timestamp)
        if not Movement.read(db, id).transactions:
            cls.delete(db, id)
