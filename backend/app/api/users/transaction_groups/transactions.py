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

from typing import Iterable

from fastapi import APIRouter

from app.crud.transaction import CRUDTransaction
from app.crud.transactiongroup import CRUDTransactionGroup
from app.database.deps import DBSession
from app.deps.user import CurrentUser
from app.schemas.transaction import TransactionApiOut
from app.schemas.transactiongroup import TransactionGroupApiOut

router = APIRouter()


@router.get("/")
def read_many(
    db: DBSession, me: CurrentUser, transaction_group_id: int
) -> Iterable[TransactionApiOut]:
    return CRUDTransaction.read_many(
        db, user_id=me.id, consolidated=False, transaction_group_id=transaction_group_id
    )


@router.put("/")
def add(
    db: DBSession,
    me: CurrentUser,
    transaction_group_id: int,
    transaction_ids: list[int],
) -> TransactionGroupApiOut:
    CRUDTransactionGroup.read(db, id=transaction_group_id, user_id=me.id)
    for transaction_id in transaction_ids:
        CRUDTransaction.read(db, id=transaction_id, user_id=me.id)
    return CRUDTransactionGroup.add_transactions(
        db, transaction_group_id, transaction_ids
    )


@router.delete("/{transaction_id}")
def remove(
    db: DBSession, me: CurrentUser, transaction_group_id: int, transaction_id: int
) -> TransactionGroupApiOut | None:
    CRUDTransaction.read(
        db, id=transaction_id, user_id=me.id, transaction_group_id=transaction_group_id
    )
    return CRUDTransactionGroup.remove_transaction(
        db, transaction_group_id, transaction_id
    )
