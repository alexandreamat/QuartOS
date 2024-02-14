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
)
from app.features.transaction.models import Transaction
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
        if old_movement_id:
            old_movement = Movement.read(db, old_movement_id)
            Movement.update(db, old_movement.id)
            if not old_movement.transactions:
                cls.delete(db, old_movement_id)
            db.refresh(movement)
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
        cls, db: Session, transaction_ids: Sequence[int], **kwargs: Any
    ) -> MovementApiOut:
        movement = Movement.create(db, name="", **kwargs)
        for transaction_id in transaction_ids:
            cls.__add_transaction(db, movement, transaction_id)
        Movement.update(db, movement.id)
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
    def update_categories(cls, db: Session) -> Iterable[MovementApiOut]:
        for m in cls.read_many(db, 0, 0):
            yield MovementApiOut.model_validate(
                Movement.update(db, m.id, category_id=m.category_id)
            )

    @classmethod
    def remove_transaction(
        cls, db: Session, movement_id: int, transaction_id: int
    ) -> MovementApiOut | None:
        stmnt = (
            Movement.select()
            .join(Transaction)
            .where(Movement.id == movement_id)
            .where(Transaction.id == transaction_id)
        )
        movement = db.scalars(stmnt).one()
        Transaction.update(db, transaction_id, movement_id=None)
        if len(movement.transactions) <= 1:
            Movement.delete(db, movement_id)
            return None
        return MovementApiOut.model_validate(movement)
