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
from typing import Any, Generic

from sqlalchemy import Select
from sqlalchemy.orm import Session

from app.crud.common import CRUDBase, InSchemaT, OutSchemaT
from app.models.account import Account, NonInstitutionalAccount
from app.models.transaction import Transaction
from app.models.userinstitutionlink import UserInstitutionLink
from app.schemas.file import FileApiOut
from app.schemas.transaction import (
    TransactionApiOut,
    TransactionApiIn,
    TransactionPlaidIn,
    TransactionPlaidOut,
)

logger = logging.getLogger(__name__)


class __CRUDTransactionBase(
    Generic[OutSchemaT, InSchemaT], CRUDBase[Transaction, OutSchemaT, InSchemaT]
):
    __model__ = Transaction


class CRUDTransaction(__CRUDTransactionBase[TransactionApiOut, TransactionApiIn]):
    __out_schema__ = TransactionApiOut

    @classmethod
    def select(cls, user_id: int = 0, **kwargs: Any) -> Select[tuple[Transaction]]:
        statement = super().select(**kwargs)
        if user_id:
            statement = statement.join(Account)
            statement = statement.outerjoin(UserInstitutionLink)
            statement = statement.where(
                (NonInstitutionalAccount.user_id == user_id)
                | (UserInstitutionLink.user_id == user_id)
            )
        return statement

    @classmethod
    def orphan_only_children(cls, db: Session) -> None:
        for t in db.scalars(cls.select()).yield_per(50):
            if not t.transaction_group_id or not t.transaction_group:
                continue
            if len(t.transaction_group.transactions) > 1:
                continue
            t.transaction_group.delete(db, t.transaction_group_id)

    @classmethod
    def update(
        cls, db: Session, id: int, obj_in: TransactionApiIn, **kwargs: Any
    ) -> TransactionApiOut:
        transaction = Transaction.update(db, id, **obj_in.model_dump(), **kwargs)
        if transaction_group := transaction.transaction_group:
            transaction_group.update(db, transaction_group.id)
        return TransactionApiOut.model_validate(transaction)

    @classmethod
    def delete(cls, db: Session, id: int) -> int:
        transaction_group = Transaction.read(db, id).transaction_group
        if transaction_group:
            if len(transaction_group.transactions) <= 2:
                transaction_group.delete(db, transaction_group.id)
        return super().delete(db, id)


class CRUDSyncableTransaction(
    __CRUDTransactionBase[TransactionPlaidOut, TransactionPlaidIn],
):
    __out_schema__ = TransactionPlaidOut
