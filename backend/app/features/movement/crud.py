from typing import Iterable
from datetime import date
from decimal import Decimal

from sqlmodel import Session

from app.common.crud import CRUDBase
from app.common.models import CurrencyCode

from app.features.user import UserApiOut  # type: ignore [attr-defined]
from app.features.transaction import (  # type: ignore [attr-defined]
    Transaction,
    TransactionApiIn,
    TransactionApiOut,
    TransactionPlaidIn,
    TransactionPlaidOut,
    CRUDTransaction,
    CRUDSyncableTransaction,
)

from .models import Movement, MovementApiIn, MovementApiOut, PLStatement, MovementFields


class CRUDMovement(CRUDBase[Movement, MovementApiOut, MovementApiIn]):
    db_model = Movement
    out_model = MovementApiOut

    @classmethod
    def create(  # type: ignore [override]
        cls,
        db: Session,
        transaction: TransactionApiIn | int,
    ) -> MovementApiOut:
        new_movement = Movement.create(db)

        if isinstance(transaction, TransactionApiIn):
            transaction.movement_id = new_movement.id
            CRUDTransaction.create(db, transaction)
        else:  # int
            transaction_db = Transaction.read(db, transaction)
            old_movement = Movement.read(db, transaction_db.movement_id)
            transaction_db.movement_id = new_movement.id
            Transaction.update(db, transaction, transaction_db)
            if not old_movement.transactions:
                Movement.delete(db, old_movement.id)

        return CRUDMovement.read(db, new_movement.id)

    @classmethod
    def create_syncable(
        cls, db: Session, transaction: TransactionPlaidIn
    ) -> MovementApiOut:
        movement = Movement.create(db)
        transaction.movement_id = movement.id
        CRUDSyncableTransaction.create(db, transaction)
        return CRUDMovement.read(db, movement.id)

    @classmethod
    def read_users(cls, db: Session, id: int) -> Iterable[UserApiOut]:
        for user in Movement.read(db, id).users:
            yield UserApiOut.from_orm(user)

    @classmethod
    def read_many_by_user(
        cls,
        db: Session,
        user_id: int,
        page: int,
        per_page: int,
        start_date: date | None,
        end_date: date | None,
        search: str | None,
        amount_gt: Decimal | None,
        amount_lt: Decimal | None,
        account_id: int,
        is_descending: bool,
        sort_by: MovementFields,
    ) -> Iterable[MovementApiOut]:
        for m in Movement.read_many_by_user(
            db,
            user_id,
            page,
            per_page,
            start_date,
            end_date,
            search,
            amount_gt,
            amount_lt,
            account_id,
            is_descending,
            sort_by,
        ):
            yield MovementApiOut.from_orm(m)

    @classmethod
    def add_transaction(
        cls, db: Session, id: int, transaction_in: TransactionApiIn
    ) -> MovementApiOut:
        movement = Movement.read(db, id)
        transaction_in.movement_id = movement.id
        CRUDTransaction.create(db, transaction_in)
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
        transaction_in: TransactionApiIn,
    ) -> TransactionApiOut:
        movement = Movement.read(db, id)
        transaction_out = CRUDTransaction.update(db, transaction_id, transaction_in)
        if not movement.transactions:
            cls.delete(db, id)
        return transaction_out

    @classmethod
    def update_syncable(
        cls,
        db: Session,
        id: int,
        transaction_id: int,
        transaction_in: TransactionPlaidIn,
    ) -> TransactionPlaidOut:
        return CRUDSyncableTransaction.update(db, transaction_id, transaction_in)

    @classmethod
    def delete_transaction(cls, db: Session, id: int, transaction_id: int) -> None:
        movement = Movement.read(db, id)
        CRUDTransaction.delete(db, transaction_id)
        if not movement.transactions:
            cls.delete(db, id)

    @classmethod
    def get_monthly_aggregate(
        cls,
        db: Session,
        user_id: int,
        start_date: date,
        end_date: date,
        currency_code: CurrencyCode,
    ) -> PLStatement:
        return Movement.get_monthly_aggregate(
            db, user_id, start_date, end_date, currency_code
        )

    @classmethod
    def get_many_monthly_aggregates(
        cls,
        db: Session,
        user_id: int,
        currency_code: CurrencyCode,
        page: int,
        per_page: int,
    ) -> Iterable[PLStatement]:
        for pl in Movement.get_many_monthly_aggregates(
            db, user_id, currency_code, page, per_page
        ):
            yield PLStatement.from_orm(pl)
