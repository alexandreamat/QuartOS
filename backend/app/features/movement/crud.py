from typing import Iterable, Any, Sequence

from sqlmodel import Session

from app.common.crud import CRUDBase
from app.common.models import CurrencyCode

from app.features.transaction import (
    TransactionApiOut,
    TransactionApiIn,
    CRUDTransaction,
    CRUDSyncableTransaction,
    TransactionPlaidIn,
)

from .models import Movement, MovementApiIn, MovementApiOut


class CRUDMovement(CRUDBase[Movement, MovementApiOut, MovementApiIn]):
    db_model = Movement
    out_model = MovementApiOut

    @classmethod
    def create(  # type: ignore[override]
        cls,
        db: Session,
        transactions: Sequence[TransactionApiIn | int],
        **kwargs: Any,
    ) -> MovementApiOut:
        movement = Movement.create(db, Movement(name=""))
        for transaction in transactions:
            if isinstance(transaction, TransactionApiIn):
                transaction_in = transaction
                if not movement.name:
                    movement.name = transaction_in.name
                CRUDTransaction.create(
                    db,
                    transaction_in,
                    movement_id=movement.id,
                    **kwargs,
                )

            else:
                transaction_id = transaction
                transaction_out = CRUDTransaction.read(db, transaction_id)
                old_movement_id = transaction_out.movement_id
                if not movement.name:
                    movement.name = transaction_out.name
                transaction_in = TransactionApiIn(
                    amount=transaction_out.amount,
                    timestamp=transaction_out.timestamp,
                    name=transaction_out.name,
                )
                transaction_out = CRUDTransaction.update(
                    db,
                    transaction_id,
                    transaction_in,
                    movement_id=movement.id,
                    **kwargs,
                )
                old_movement = Movement.read(db, old_movement_id)
                if not old_movement.transactions:
                    cls.delete(db, old_movement_id)

        return CRUDMovement.read(db, movement.id)

    @classmethod
    def create_plaid(
        cls,
        db: Session,
        transaction_in: TransactionPlaidIn,
        **kwargs: Any,
    ) -> MovementApiOut:
        movement = Movement.create(db, Movement(name=transaction_in.name))
        CRUDSyncableTransaction.create(
            db, transaction_in, movement_id=movement.id, **kwargs
        )
        return CRUDMovement.read(db, movement.id)

    @classmethod
    def read(
        cls, db: Session, id: int, currency_code: CurrencyCode = CurrencyCode("USD")
    ) -> MovementApiOut:
        movement = Movement.read(db, id)
        return cls.out_model.from_orm(
            movement, {"amount": movement.get_amount(currency_code)}
        )

    @classmethod
    def create_transaction(
        cls,
        db: Session,
        movement_id: int,
        transaction_in: TransactionApiIn,
        **kwargs: Any,
    ) -> TransactionApiOut:
        transaction_out = CRUDTransaction.create(
            db,
            transaction_in,
            movement_id=movement_id,
            **kwargs,
        )
        return transaction_out

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
        movement_id: int,
        transaction_id: int,
        transaction_in: TransactionApiIn,
        new_movement_id: int,
        **kwargs: Any,
    ) -> TransactionApiOut:
        movement = Movement.read(db, movement_id)
        transaction_out = CRUDTransaction.update(
            db, transaction_id, transaction_in, movement_id=new_movement_id, **kwargs
        )
        if not movement.transactions:
            cls.delete(db, movement.id)
        return TransactionApiOut.from_orm(transaction_out)

    @classmethod
    def delete_transaction(cls, db: Session, id: int, transaction_id: int) -> None:
        CRUDTransaction.delete(db, transaction_id)
        if not Movement.read(db, id).transactions:
            cls.delete(db, id)
