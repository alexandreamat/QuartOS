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

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import NoResultFound

from app.crud.account import CRUDSyncableAccount
from app.crud.institution import CRUDSyncableInstitution
from app.crud.userinstitutionlink import (
    CRUDSyncableUserInstitutionLink,
    CRUDUserInstitutionLink,
)
from app.database.deps import DBSession
from app.deps.user import CurrentUser
from app.plaid.account import fetch_accounts
from app.plaid.common import create_link_token, exchange_public_token
from app.plaid.institution import fetch_institution
from app.plaid.userinstitutionlink import fetch_user_institution_link
from app.schemas.userinstitutionlink import (
    UserInstitutionLinkApiIn,
    UserInstitutionLinkApiOut,
)
from app.utils import include_package_routes

router = APIRouter()


@router.get("/link_token")
def get_link_token(
    db: DBSession,
    me: CurrentUser,
    user_institution_link_id: int | None = None,
) -> str:
    if user_institution_link_id:
        user_institution_link_out = CRUDUserInstitutionLink.read(
            db, id=user_institution_link_id, user_id=me.id
        )
        user_institution_link_plaid_out = CRUDSyncableUserInstitutionLink.read(
            db, id=user_institution_link_out.id
        )
        access_token = user_institution_link_plaid_out.access_token
    else:
        access_token = None
    return create_link_token(me.id, access_token)


@router.post("/public_token")
def set_public_token(
    db: DBSession,
    me: CurrentUser,
    public_token: str,
    institution_plaid_id: str,
) -> None:
    # 1. Get or create institution
    try:
        institution_out = CRUDSyncableInstitution.read(
            db, plaid_id=institution_plaid_id
        )
    except NoResultFound:
        institution_out = CRUDSyncableInstitution.create(
            db, fetch_institution(institution_plaid_id)
        )

    # 2. Create user institution link
    access_token = exchange_public_token(public_token)
    user_institution_link_in = fetch_user_institution_link(access_token)
    user_institution_link_out = CRUDSyncableUserInstitutionLink.create(
        db, user_institution_link_in, institution_id=institution_out.id, user_id=me.id
    )

    # 3. Create accounts
    for account_in in fetch_accounts(user_institution_link_out):
        CRUDSyncableAccount.create(
            db, account_in, user_institution_link_id=user_institution_link_out.id
        )


@router.post("/")
def create(
    db: DBSession,
    me: CurrentUser,
    user_institution_link_in: UserInstitutionLinkApiIn,
    institution_id: int,
) -> UserInstitutionLinkApiOut:
    return CRUDUserInstitutionLink.create(
        db, user_institution_link_in, user_id=me.id, institution_id=institution_id
    )


@router.get("/{user_institution_link_id}")
def read(
    db: DBSession, me: CurrentUser, user_institution_link_id: int
) -> UserInstitutionLinkApiOut:
    return CRUDUserInstitutionLink.read(db, id=user_institution_link_id, user_id=me.id)


@router.get("/")
def read_many(db: DBSession, me: CurrentUser) -> Iterable[UserInstitutionLinkApiOut]:
    return CRUDUserInstitutionLink.read_many(db, user_id=me.id)


@router.put("/{user_institution_link_id}")
def update(
    db: DBSession,
    me: CurrentUser,
    user_institution_link_id: int,
    user_institution_link_in: UserInstitutionLinkApiIn,
) -> UserInstitutionLinkApiOut:
    curr_institution_link = CRUDUserInstitutionLink.read(
        db, id=user_institution_link_id, user_id=me.id
    )
    if curr_institution_link.is_synced:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return CRUDUserInstitutionLink.update(
        db, user_institution_link_id, user_institution_link_in
    )


@router.delete("/{user_institution_link_id}")
def delete(db: DBSession, me: CurrentUser, user_institution_link_id: int) -> int:
    CRUDUserInstitutionLink.read(db, id=user_institution_link_id, user_id=me.id)
    return CRUDUserInstitutionLink.delete(db, user_institution_link_id)


include_package_routes(router, __name__, __path__, "/{user_institution_link_id}")
