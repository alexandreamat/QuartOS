# Copyright (C) 2024 Alexandre Amat
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
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
    def __add_transaction(
        cls, db: Session, movement: Movement, transaction_id: int
    ) -> MovementApiOut:
        transaction_out = CRUDTransaction.read(db, transaction_id)
        old_movement_id = transaction_out.movement_id
        if not movement.name:
            movement.name = transaction_out.name
        transaction_in = TransactionApiIn.model_validate(transaction_out)
        transaction_out = CRUDTransaction.update(
            db,
            transaction_id,
            transaction_in,
            movement_id=movement.id,
        )
        old_movement = Movement.read(db, old_movement_id)
        cls.__update_category(db, old_movement.id)
        if not old_movement.transactions:
            cls.delete(db, old_movement_id)
        return MovementApiOut.model_validate(movement)

    @classmethod
    def __update_category(cls, db: Session, movement_id: int) -> Movement:
        m = Movement.read(db, movement_id)
        return Movement.update(db, movement_id, category_id=m.default_category_id)

    @classmethod
    def create(  # type: ignore[override]
        cls, db: Session, transactions: Sequence[TransactionApiIn | int], **kwargs: Any
    ) -> MovementApiOut:
        movement = Movement.create(db, name="")
        for transaction in transactions:
            if isinstance(transaction, TransactionApiIn):
                transaction_in = transaction
                if not movement.name:
                    movement.name = transaction_in.name
                cls.create_transaction(db, movement.id, transaction_in, **kwargs)
            else:
                transaction_id = transaction
                cls.__add_transaction(db, movement, transaction_id)
        cls.__update_category(db, movement.id)
        return CRUDMovement.read(db, movement.id)

    @classmethod
    def create_plaid(
        cls,
        db: Session,
        transaction_in: TransactionPlaidIn,
        **kwargs: Any,
    ) -> MovementApiOut:
        movement = Movement.create(db, name=transaction_in.name)
        CRUDSyncableTransaction.create(
            db, transaction_in, movement_id=movement.id, **kwargs
        )
        cls.__update_category(db, movement.id)
        return CRUDMovement.read(db, movement.id)

    @classmethod
    def read(cls, db: Session, id: int) -> MovementApiOut:
        movement = Movement.read(db, id)
        return MovementApiOut.model_validate(movement)

    @classmethod
    def add_transactions(
        cls, db: Session, movement_id: int, transaction_ids: list[int]
    ) -> MovementApiOut:
        movement = Movement.read(db, movement_id)
        for transaction_id in transaction_ids:
            cls.__add_transaction(db, movement, transaction_id)
        cls.__update_category(db, movement_id)
        return CRUDMovement.read(db, movement_id)

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
        cls.__update_category(db, movement_id)
        return transaction_out

    @classmethod
    def read_transactions(
        cls, db: Session, movement_id: int
    ) -> Iterable[TransactionApiOut]:
        for t in Movement.read(db, movement_id).transactions:
            yield TransactionApiOut.model_validate(t)

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
        cls.__update_category(db, movement_id)
        return TransactionApiOut.model_validate(transaction_out)

    @classmethod
    def delete_transaction(
        cls, db: Session, movement_id: int, transaction_id: int
    ) -> None:
        CRUDTransaction.delete(db, transaction_id)
        cls.__update_category(db, movement_id)
        if not Movement.read(db, movement_id).transactions:
            cls.delete(db, movement_id)

    @classmethod
    def update_categories(cls, db: Session) -> Iterable[MovementApiOut]:
        for m in cls.read_many(db, 0, 0):
            yield MovementApiOut.model_validate(cls.__update_category(db, m.id))
