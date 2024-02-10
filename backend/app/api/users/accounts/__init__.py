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

from fastapi import APIRouter, UploadFile, File

from app.common.exceptions import UnknownError
from app.database.deps import DBSession
from app.features.account import (
    CRUDAccount,
    AccountApiOut,
    AccountApiIn,
)
from app.features.transaction import (
    TransactionApiIn,
    get_transactions_from_csv,
)
from app.features.user import CRUDUser, CurrentUser
from app.features.userinstitutionlink import SyncedEntity
from . import movements

router = APIRouter()


@router.get("/")
def read_many(db: DBSession, me: CurrentUser) -> Iterable[AccountApiOut]:
    return CRUDUser.read_accounts(db, me.id, None)


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


@router.post("/")
def create(
    db: DBSession,
    me: CurrentUser,
    account_in: AccountApiIn,
    userinstitutionlink_id: int | None = None,
) -> AccountApiOut:
    if account_in.institutionalaccount and userinstitutionlink_id:
        CRUDUser.read_user_institution_link(db, me.id, userinstitutionlink_id)
    return CRUDAccount.create(
        db, account_in, userinstitutionlink_id=userinstitutionlink_id, user_id=me.id
    )


@router.get("/{account_id}")
def read(db: DBSession, me: CurrentUser, account_id: int) -> AccountApiOut:
    return CRUDUser.read_account(db, me.id, None, account_id=account_id)


@router.put("/{account_id}")
def update(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    account_in: AccountApiIn,
    userinstitutionlink_id: int | None,
) -> AccountApiOut:
    if CRUDAccount.is_synced(db, account_id):
        raise SyncedEntity()
    CRUDUser.read_account(db, me.id, None, account_id)
    return CRUDAccount.update(
        db,
        account_id,
        account_in,
        userinstitutionlink_id=userinstitutionlink_id,
        user_id=me.id,
    )


@router.delete("/{account_id}")
def delete(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
) -> int:
    account_out = CRUDUser.read_account(db, me.id, None, account_id)
    if account_out.is_synced:
        raise SyncedEntity()
    return CRUDAccount.delete(db, account_id)


router.include_router(
    movements.router, prefix="/{account_id}/movements", tags=["movements"]
)
