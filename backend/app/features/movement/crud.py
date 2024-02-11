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
import logging
from typing import Iterable, Any, Sequence

from sqlalchemy.orm import Session

from app.common.crud import CRUDBase
from app.features.transaction import (
    TransactionApiOut,
    TransactionApiIn,
    CRUDTransaction,
    CRUDSyncableTransaction,
    TransactionPlaidIn,
)
from .models import Movement
from .schemas import MovementApiIn, MovementApiOut

logger = logging.getLogger(__name__)


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
        Movement.update(db, old_movement.id)
        if not old_movement.transactions:
            cls.delete(db, old_movement_id)
        db.refresh(movement)
        return MovementApiOut.model_validate(movement)

    @classmethod
    def merge(cls, db: Session, movement_ids: list[int]) -> MovementApiOut:
        transaction_ids = [
            transaction.id
            for movement_id in movement_ids
            for transaction in Movement.read(db, movement_id).transactions
        ]
        return cls.create(db, transaction_ids)

    @classmethod
    def create(  # type: ignore[override]
        cls, db: Session, transactions: Sequence[TransactionApiIn | int], **kwargs: Any
    ) -> MovementApiOut:
        transaction_kwargs = {
            kw.strip("transaction__"): kwargs.pop(kw)
            for kw in kwargs
            if kw.startswith("transaction__")
        }
        movement = Movement.create(db, name="", **kwargs)
        for transaction in transactions:
            if isinstance(transaction, TransactionApiIn):
                transaction_in = transaction
                if not movement.name:
                    movement.name = transaction_in.name
                cls.create_transaction(
                    db, movement.id, transaction_in, **transaction_kwargs
                )
            else:
                transaction_id = transaction
                cls.__add_transaction(db, movement, transaction_id)
        Movement.update(db, movement.id)
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
        Movement.update(db, movement.id)
        # force SQLAlchemy to refresh tx-mv relationship
        db.refresh(movement)
        return CRUDMovement.read(db, movement.id)

    @classmethod
    def add_transactions(
        cls, db: Session, movement_id: int, transaction_ids: list[int]
    ) -> MovementApiOut:
        movement = Movement.read(db, movement_id)
        for transaction_id in transaction_ids:
            cls.__add_transaction(db, movement, transaction_id)
        Movement.update(db, movement_id)
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
        Movement.update(db, movement_id)
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
        Movement.update(db, movement_id)
        return TransactionApiOut.model_validate(transaction_out)

    @classmethod
    def delete_transaction(
        cls, db: Session, movement_id: int, transaction_id: int
    ) -> None:
        CRUDTransaction.delete(db, transaction_id)
        Movement.update(db, movement_id)
        if not Movement.read(db, movement_id).transactions:
            cls.delete(db, movement_id)

    @classmethod
    def update_categories(cls, db: Session) -> Iterable[MovementApiOut]:
        for m in cls.read_many(db, 0, 0):
            yield MovementApiOut.model_validate(
                Movement.update(db, m.id, category_id=m.default_category_id)
            )
