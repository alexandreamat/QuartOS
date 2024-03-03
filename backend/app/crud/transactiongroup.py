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

from sqlalchemy import Select, or_
from sqlalchemy.orm import Session

from app.crud.common import CRUDBase
from app.models.account import Account, NonInstitutionalAccount
from app.models.transaction import Transaction
from app.models.transactiongroup import TransactionGroup
from app.models.userinstitutionlink import UserInstitutionLink
from app.schemas.transactiongroup import TransactionGroupApiIn, TransactionGroupApiOut

logger = logging.getLogger(__name__)


class CRUDTransactionGroup(
    CRUDBase[TransactionGroup, TransactionGroupApiOut, TransactionGroupApiIn]
):
    db_model = TransactionGroup
    out_model = TransactionGroupApiOut

    @classmethod
    def create(
        cls,
        db: Session,
        obj_in: TransactionGroupApiIn,
        transaction_ids: list[int] | None = None,
        **kwargs: Any
    ) -> TransactionGroupApiOut:
        transaction_ids = transaction_ids or []
        transaction_group = TransactionGroup.create(db, **obj_in.model_dump(), **kwargs)
        return cls.add_transactions(db, transaction_group.id, transaction_ids)

    @classmethod
    def merge(
        cls, db: Session, transaction_group_ids: list[int]
    ) -> TransactionGroupApiOut:
        transaction_ids = [
            transaction.id
            for transaction_group_id in transaction_group_ids
            for transaction in TransactionGroup.read(
                db, transaction_group_id
            ).transactions
        ]
        transaction_group_in = TransactionGroupApiIn(name="")
        return cls.create(db, transaction_group_in, transaction_ids)

    @classmethod
    def update_categories(cls, db: Session) -> Iterable[TransactionGroupApiOut]:
        for m in cls.read_many(db):
            yield TransactionGroupApiOut.model_validate(
                TransactionGroup.update(db, m.id, category_id=m.category_id)
            )

    @classmethod
    def select(
        cls, *, user_id: int | None = None, **kwargs: Any
    ) -> Select[tuple[TransactionGroup]]:
        statement = super().select(**kwargs)
        if user_id:
            statement = statement.join(Transaction)
            statement = statement.join(Account)
            statement = statement.outerjoin(UserInstitutionLink)
            statement = statement.where(
                or_(
                    NonInstitutionalAccount.user_id == user_id,
                    UserInstitutionLink.user_id == user_id,
                )
            )
        logger.error(statement.compile(compile_kwargs={"literal_binds": True}))
        return statement

    @classmethod
    def update_all(cls, db: Session, user_id: int) -> None:
        for m in db.scalars(cls.select(user_id=user_id)).all():
            TransactionGroup.update(db, m.id)

    @classmethod
    def __add_transaction(
        cls, db: Session, id: int, transaction_id: int
    ) -> TransactionGroup:
        transaction_group = TransactionGroup.read(db, id)
        transaction = Transaction.read(db, transaction_id)
        old_transaction_group_id = transaction.transaction_group_id
        if not transaction_group.name:
            transaction_group.name = transaction.name
        transaction = Transaction.update(
            db, transaction_id, transaction_group_id=transaction_group.id
        )
        if old_transaction_group_id:
            old_transaction_group = TransactionGroup.read(db, old_transaction_group_id)
            TransactionGroup.update(db, old_transaction_group.id)
            if not old_transaction_group.transactions:
                cls.delete(db, old_transaction_group_id)
        return transaction_group

    @classmethod
    def add_transactions(
        cls, db: Session, transaction_group_id: int, transaction_ids: list[int]
    ) -> TransactionGroupApiOut:
        transaction_group = TransactionGroup.read(db, transaction_group_id)
        for transaction_id in transaction_ids:
            cls.__add_transaction(db, transaction_group.id, transaction_id)
        TransactionGroup.update(db, transaction_group_id)
        db.refresh(transaction_group)
        return CRUDTransactionGroup.read(db, id=transaction_group_id)

    @classmethod
    def remove_transaction(
        cls, db: Session, transaction_group_id: int, transaction_id: int
    ) -> TransactionGroupApiOut | None:
        transaction_group = TransactionGroup.read(db, transaction_group_id)
        Transaction.update(db, transaction_id, transaction_group_id=None)
        if len(transaction_group.transactions) <= 1:
            TransactionGroup.delete(db, transaction_group_id)
            return None
        return TransactionGroupApiOut.model_validate(transaction_group)
