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
from typing import Any, Iterable

from sqlalchemy import Select
from sqlalchemy.orm import Session

from app.crud.common import CRUDBase
from app.crud.transaction import CRUDTransaction
from app.models.movement import Movement
from app.models.transaction import Transaction
from app.schemas.movement import MovementApiIn, MovementApiOut
from app.schemas.transaction import TransactionApiIn

logger = logging.getLogger(__name__)


class CRUDMovement(CRUDBase[Movement, MovementApiOut, MovementApiIn]):
    db_model = Movement
    out_model = MovementApiOut

    @classmethod
    def create(
        cls,
        db: Session,
        obj_in: MovementApiIn,
        transaction_ids: list[int] | None = None,
        **kwargs: Any
    ) -> MovementApiOut:
        transaction_ids = transaction_ids or []
        movement = Movement.create(db, **obj_in.model_dump(), **kwargs)
        return cls.add_transactions(db, movement.id, transaction_ids)

    @classmethod
    def merge(cls, db: Session, movement_ids: list[int]) -> MovementApiOut:
        transaction_ids = [
            transaction.id
            for movement_id in movement_ids
            for transaction in Movement.read(db, movement_id).transactions
        ]
        movement_in = MovementApiIn(name="")
        return cls.create(db, movement_in, transaction_ids)

    @classmethod
    def update_categories(cls, db: Session) -> Iterable[MovementApiOut]:
        for m in cls.read_many(db):
            yield MovementApiOut.model_validate(
                Movement.update(db, m.id, category_id=m.category_id)
            )

    @classmethod
    def select(
        cls, *, user_id: int | None = None, **kwargs: Any
    ) -> Select[tuple[Movement]]:
        return super().select(user_id=user_id, **kwargs)

    @classmethod
    def update_all(cls, db: Session, user_id: int) -> None:
        for m in db.scalars(cls.select(user_id=user_id)).all():
            Movement.update(db, m.id)

    @classmethod
    def __add_transaction(cls, db: Session, id: int, transaction_id: int) -> Movement:
        movement = Movement.read(db, id)
        transaction = Transaction.read(db, transaction_id)
        old_movement_id = transaction.movement_id
        if not movement.name:
            movement.name = transaction.name
        transaction = Transaction.update(db, transaction_id, movement_id=movement.id)
        if old_movement_id:
            old_movement = Movement.read(db, old_movement_id)
            Movement.update(db, old_movement.id)
            if not old_movement.transactions:
                cls.delete(db, old_movement_id)
        return movement

    @classmethod
    def add_transactions(
        cls, db: Session, movement_id: int, transaction_ids: list[int]
    ) -> MovementApiOut:
        movement = Movement.read(db, movement_id)
        for transaction_id in transaction_ids:
            cls.__add_transaction(db, movement.id, transaction_id)
        Movement.update(db, movement_id)
        db.refresh(movement)
        return CRUDMovement.read(db, movement_id)

    @classmethod
    def remove_transaction(
        cls, db: Session, movement_id: int, transaction_id: int
    ) -> MovementApiOut | None:
        movement = Movement.read(db, movement_id)
        Transaction.update(db, transaction_id, movement_id=None)
        if len(movement.transactions) <= 1:
            Movement.delete(db, movement_id)
            return None
        return MovementApiOut.model_validate(movement)
