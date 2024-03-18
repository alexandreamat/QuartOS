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
from datetime import date
from typing import Any, Generic

from sqlalchemy import Select
from sqlalchemy.orm import Session

from app.crud.common import CRUDBase, InSchemaT, OutSchemaT
from app.models.account import Account, NonInstitutionalAccount
from app.models.transaction import Transaction
from app.models.userinstitutionlink import UserInstitutionLink
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
        cls, db: Session, id: int, obj_in: InSchemaT, **kwargs: Any
    ) -> OutSchemaT:
        transaction = Transaction.update(db, id, **obj_in.model_dump(), **kwargs)
        if transaction_group := transaction.transaction_group:
            transaction_group.update(db, transaction_group.id)
        return cls.__out_schema__.model_validate(transaction)

    @classmethod
    def update_account_balances(
        cls, db: Session, id: int, timestamp: date | None = None
    ) -> None:
        account = Account.read(db, id__eq=id)

        if timestamp:
            statement = Transaction.select(
                account_id__eq=id, timestamp__lt=timestamp, order_by="timestamp__desc"
            )
            prev_transaction = db.scalars(statement).first()
            if prev_transaction:
                prev_balance = prev_transaction.account_balance
            else:
                prev_balance = account.initial_balance
            statement = Transaction.select(
                account_id__eq=id, timestamp__ge=timestamp, order_by="timestamp__asc"
            )
        else:
            statement = Transaction.select(account_id__eq=id, order_by="timestamp__asc")
            prev_balance = account.initial_balance

        for transaction in db.scalars(statement).yield_per(50):
            account_balance = prev_balance + transaction.amount
            Transaction.update(db, transaction.id, account_balance=account_balance)
            prev_balance = transaction.account_balance

    @classmethod
    def delete(cls, db: Session, id: int) -> int:
        transaction = Transaction.read(db, id__eq=id)

        # Store values from the transaction being deleted
        timestamp = transaction.timestamp
        account = transaction.account
        transaction_group = transaction.transaction_group

        # Delete group if it's going to have only 1 transaction left
        if transaction_group:
            if len(transaction_group.transactions) <= 2:
                transaction_group.delete(db, transaction_group.id)

        # Delete transaction from DB
        super().delete(db, id)

        # Update account balances in account's transactions from that point
        cls.update_account_balances(db, account.id, timestamp)

        return id


class CRUDTransaction(__CRUDTransactionBase[TransactionApiOut, TransactionApiIn]):
    __out_schema__ = TransactionApiOut


class CRUDSyncableTransaction(
    __CRUDTransactionBase[TransactionPlaidOut, TransactionPlaidIn],
):
    __out_schema__ = TransactionPlaidOut
