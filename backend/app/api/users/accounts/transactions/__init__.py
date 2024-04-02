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
from typing import Annotated, Iterable

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.crud.account import CRUDAccount
from app.crud.transaction import CRUDTransaction
from app.crud.transactiondeserialiser import CRUDTransactionDeserialiser
from app.database.deps import DBSession
from app.deps.user import CurrentUser
from app.exceptions.common import UnknownError
from app.schemas.transaction import (
    TransactionApiIn,
    TransactionApiOut,
    TransactionQueryArg,
)
from app.utils import include_package_routes
from app.utils.transaction import get_transactions_from_csv

router = APIRouter()

logger = logging.getLogger(__name__)


@router.post("/preview")
def preview(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    file: Annotated[UploadFile, File(...)],
) -> Iterable[TransactionApiIn]:
    deserialiser = CRUDTransactionDeserialiser.read(
        db, user_id=me.id, account_id=account_id
    )
    account_out = CRUDAccount.read(db, user_id=me.id, id=account_id)
    try:
        yield from get_transactions_from_csv(
            deserialiser, file.file, account_out.id, account_out.default_bucket_id
        )
    except Exception as e:
        raise UnknownError(e)


@router.post("/batch/")
def create_many(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    transactions: list[TransactionApiIn],
) -> Iterable[TransactionApiOut]:
    CRUDAccount.read(db, id=account_id, user_id=me.id)
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
    transaction_group_id: int | None = None,
) -> TransactionApiOut:
    CRUDAccount.read(db, id=account_id, user_id=me.id)
    return CRUDAccount.create_transaction(
        db,
        account_id,
        transactions,
        transaction_group_id=transaction_group_id,
        default_currency_code=me.default_currency_code,
    )


@router.get("")
def read_many(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    kwargs: TransactionQueryArg = Depends(),
) -> Iterable[TransactionApiOut]:
    return CRUDTransaction.read_many(
        db,
        user_id=me.id,
        account_id=account_id,
        **kwargs.model_dump(exclude={"account_id__eq"}, exclude_none=True)
    )


@router.put("/{transaction_id}")
def update(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    transaction_id: int,
    transaction_in: TransactionApiIn,
) -> TransactionApiOut:
    CRUDTransaction.read(db, id=transaction_id, user_id=me.id, account_id=account_id)
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
    transaction_out = CRUDTransaction.read(
        db, id=transaction_id, user_id=me.id, account_id=account_id
    )
    if transaction_out.is_synced:
        raise HTTPException(status.HTTP_403_FORBIDDEN)

    return CRUDTransaction.delete(db, transaction_id)


include_package_routes(router, __name__, __path__, "/{transaction_id}")
