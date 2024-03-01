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

from datetime import date
from decimal import Decimal
from typing import Iterable

from fastapi import APIRouter

from app.crud.transactiongroup import CRUDTransactionGroup
from app.crud.user import CRUDUser
from app.database.deps import DBSession
from app.deps.user import CurrentUser
from app.schemas.transactiongroup import (
    TransactionGroupApiIn,
    TransactionGroupApiOut,
)
from app.utils import include_package_routes

router = APIRouter()


@router.post("/merge")
def merge(
    db: DBSession, me: CurrentUser, transaction_group_ids: list[int]
) -> TransactionGroupApiOut:
    for transaction_group_id in transaction_group_ids:
        CRUDTransactionGroup.read(db, transaction_group_id, user_id=me.id)
    return CRUDTransactionGroup.merge(db, transaction_group_ids)


@router.get("/")
def read_many(
    db: DBSession, me: CurrentUser, page: int = 0, per_page: int = 20
) -> Iterable[TransactionGroupApiOut]:
    return CRUDTransactionGroup.read_many(
        db, user_id=me.id, page=page, per_page=per_page
    )


@router.get("/{transaction_group_id}")
def read(
    db: DBSession,
    me: CurrentUser,
    transaction_group_id: int,
) -> TransactionGroupApiOut:
    return CRUDTransactionGroup.read(db, transaction_group_id, user_id=me.id)


@router.put("/")
def update_all(db: DBSession, me: CurrentUser) -> None:
    CRUDTransactionGroup.update_all(db, user_id=me.id)


@router.put("/{transaction_group_id}")
def update(
    db: DBSession,
    me: CurrentUser,
    transaction_group_id: int,
    transaction_group_in: TransactionGroupApiIn,
) -> TransactionGroupApiOut:
    CRUDTransactionGroup.read(db, transaction_group_id, user_id=me.id)
    return CRUDUser.update_transaction_group(
        db, me.id, transaction_group_id, transaction_group_in
    )


@router.delete("/{transaction_group_id}")
def delete(
    db: DBSession,
    me: CurrentUser,
    transaction_group_id: int,
) -> int:
    CRUDTransactionGroup.read(db, transaction_group_id, user_id=me.id)
    return CRUDTransactionGroup.delete(db, transaction_group_id)


include_package_routes(router, __name__, __path__, "/{transaction_group_id}")
