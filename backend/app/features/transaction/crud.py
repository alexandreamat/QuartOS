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

from sqlalchemy.orm import Session

from app.common.crud import CRUDBase, CRUDSyncedBase
from app.features.file import FileApiOut
from .models import Transaction
from .schemas import (
    TransactionApiOut,
    TransactionApiIn,
    TransactionPlaidIn,
    TransactionPlaidOut,
)

logger = logging.getLogger(__name__)


class CRUDTransaction(CRUDBase[Transaction, TransactionApiOut, TransactionApiIn]):
    db_model = Transaction
    out_model = TransactionApiOut

    @classmethod
    def is_synced(cls, db: Session, transaction_id: int) -> bool:
        return Transaction.read(db, transaction_id).is_synced

    @classmethod
    def read_files(cls, db: Session, transaction_id: int) -> Iterable[FileApiOut]:
        for f in Transaction.read(db, transaction_id).files:
            yield FileApiOut.model_validate(f)

    @classmethod
    def orphan_only_children(cls, db: Session) -> None:
        for t in Transaction.read_many(db, 0, 0):
            if not t.movement_id or not t.movement:
                continue
            if len(t.movement.transactions) > 1:
                continue
            t.movement.delete(db, t.movement_id)

    @classmethod
    def update(
        cls, db: Session, id: int, obj_in: TransactionApiIn, **kwargs: Any
    ) -> TransactionApiOut:
        transaction = Transaction.update(db, id, **obj_in.model_dump(), **kwargs)
        if movement := transaction.movement:
            movement.update(db, movement.id)
        return TransactionApiOut.model_validate(transaction)

    @classmethod
    def delete(cls, db: Session, id: int) -> int:
        movement = Transaction.read(db, id).movement
        if movement:
            if len(movement.transactions) <= 2:
                movement.delete(db, movement.id)
        return super().delete(db, id)


class CRUDSyncableTransaction(
    CRUDSyncedBase[Transaction, TransactionPlaidOut, TransactionPlaidIn],
):
    db_model = Transaction
    out_model = TransactionPlaidOut
