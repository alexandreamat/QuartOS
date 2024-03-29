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

from app.crud.account import CRUDAccount
from app.crud.userinstitutionlink import CRUDUserInstitutionLink
from app.database.deps import DBSession
from app.deps.user import CurrentUser
from app.exceptions.userinstitutionlink import SyncedEntity
from app.schemas.account import AccountApiIn, AccountApiOut
from app.utils import include_package_routes

router = APIRouter()


@router.get("/")
def read_many(db: DBSession, me: CurrentUser) -> Iterable[AccountApiOut]:
    return CRUDAccount.read_many(db, user_id=me.id)


@router.post("/")
def create(
    db: DBSession,
    me: CurrentUser,
    account_in: AccountApiIn,
    user_institution_link_id: int | None = None,
) -> AccountApiOut:
    if account_in.type in ["depository", "loan", "brokerage", "investment"]:
        assert user_institution_link_id
        CRUDUserInstitutionLink.read(db, id=user_institution_link_id, user_id=me.id)
    return CRUDAccount.create(
        db, account_in, user_institution_link_id=user_institution_link_id, user_id=me.id
    )


@router.get("/{account_id}")
def read(db: DBSession, me: CurrentUser, account_id: int) -> AccountApiOut:
    return CRUDAccount.read(db, id=account_id, user_id=me.id)


@router.put("/{account_id}")
def update(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    account_in: AccountApiIn,
    user_institution_link_id: int | None,
) -> AccountApiOut:
    # TODO editing of synced accounts should be restricted, although not prevented
    CRUDAccount.read(db, id=account_id, user_id=me.id)
    return CRUDAccount.update(
        db,
        account_id,
        account_in,
        user_institution_link_id=user_institution_link_id,
        user_id=me.id,
    )


@router.delete("/{account_id}")
def delete(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
) -> int:
    account_out = CRUDAccount.read(db, id=account_id, user_id=me.id)
    if account_out.is_synced:
        raise SyncedEntity()
    return CRUDAccount.delete(db, account_id)


include_package_routes(router, __name__, __path__, "/{account_id}")
