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

from typing import Annotated, Iterable
from fastapi import APIRouter, File, HTTPException, UploadFile, status
from app.common.exceptions import UnknownError

from app.database.deps import DBSession
from app.features.account import CRUDAccount
from app.features.transaction import (
    TransactionApiOut,
    TransactionApiIn,
    CRUDTransaction,
)
from app.features.transaction.utils import get_transactions_from_csv
from app.features.user import CurrentUser, CRUDUser
from app.utils import include_package_routes

router = APIRouter()


@router.post("/preview")
def preview(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    file: Annotated[UploadFile, File(...)],
) -> Iterable[TransactionApiIn]:
    CRUDUser.read_account(db, me.id, None, account_id)
    deserialiser = CRUDAccount.read_transaction_deserialiser(db, account_id)
    try:
        return get_transactions_from_csv(deserialiser, file.file, account_id)
    except Exception as e:
        raise UnknownError(e)


@router.post("/batch/")
def create_many(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    transactions: list[TransactionApiIn],
) -> Iterable[TransactionApiOut]:
    CRUDUser.read_account(db, me.id, None, account_id)
    yield from CRUDAccount.create_many_transactions(
        db,
        account_id,
        transactions,
        default_currency_code=me.default_currency_code,
    )


@router.post("/")
def create(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    transactions: TransactionApiIn,
    movement_id: int | None = None,
) -> TransactionApiOut:
    CRUDUser.read_account(db, me.id, None, account_id)
    return CRUDAccount.create_transaction(
        db,
        account_id,
        transactions,
        movement_id=movement_id,
        default_currency_code=me.default_currency_code,
    )


@router.put("/{transaction_id}")
def update(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    transaction_id: int,
    transaction_in: TransactionApiIn,
) -> TransactionApiOut:
    CRUDUser.read_transaction(
        db, me.id, account_id=account_id, transaction_id=transaction_id
    )
    return CRUDAccount.update_transaction(
        db,
        account_id,
        transaction_id=transaction_id,
        transaction_in=transaction_in,
        default_currency_code=me.default_currency_code,
    )


@router.delete("/{transaction_id}")
def delete(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    transaction_id: int,
) -> int:
    CRUDUser.read_transaction(
        db, me.id, account_id=account_id, transaction_id=transaction_id
    )
    if CRUDTransaction.is_synced(db, transaction_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)

    return CRUDAccount.delete_transaction(db, account_id, transaction_id)


include_package_routes(router, __name__, __path__, "/{transaction_id}")
