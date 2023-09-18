from typing import Iterable

from sqlalchemy.exc import NoResultFound
from fastapi import APIRouter, HTTPException, status

from app.database.deps import DBSession
from app.common.plaid import create_link_token, exchange_public_token

from app.features.institution import CRUDSyncableInstitution, fetch_institution
from app.features.user import CRUDUser, CurrentUser
from app.features.userinstitutionlink import (
    CRUDUserInstitutionLink,
    UserInstitutionLinkApiOut,
    UserInstitutionLinkApiIn,
    UserInstitutionLinkPlaidOut,
    CRUDSyncableUserInstitutionLink,
    fetch_user_institution_link,
)
from app.features.account import CRUDSyncableAccount, fetch_accounts

from . import plaidtransactions

router = APIRouter()


@router.get("/link_token")
def get_link_token(
    db: DBSession,
    me: CurrentUser,
    userinstitutionlink_id: int | None = None,
) -> str:
    if userinstitutionlink_id:
        userinstitutionlink_out = CRUDUser.read_user_institution_link(
            db, me.id, userinstitutionlink_id
        )
        userinstitutionlink_plaid_out = CRUDSyncableUserInstitutionLink.read(
            db, userinstitutionlink_out.id
        )
        access_token = userinstitutionlink_plaid_out.access_token
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
        institution_out = CRUDSyncableInstitution.read_by_plaid_id(
            db, institution_plaid_id
        )
    except NoResultFound:
        institution_out = CRUDSyncableInstitution.create(
            db, fetch_institution(institution_plaid_id)
        )

    # 2. Create user institution link
    access_token = exchange_public_token(public_token)
    userinstitutionlink_in = fetch_user_institution_link(
        access_token, me, institution_out
    )
    userinstitutionlink_out = CRUDSyncableUserInstitutionLink.create(
        db, userinstitutionlink_in, institution_id=institution_out.id, user_id=me.id
    )

    # 3. Create accounts
    accounts_in = fetch_accounts(userinstitutionlink_out)
    for account_in in accounts_in:
        CRUDSyncableAccount.create(
            db, account_in, userinstitutionlink_id=userinstitutionlink_out.id
        )


@router.post("/resync")
def resync(
    db: DBSession, me: CurrentUser, userinstitutionlink_id: int
) -> UserInstitutionLinkPlaidOut:
    userinstitutionlink_out = CRUDSyncableUserInstitutionLink.read(
        db, userinstitutionlink_id
    )
    institution_out = CRUDSyncableInstitution.read(
        db, userinstitutionlink_out.institution_id
    )
    userinstitutionlink_in = fetch_user_institution_link(
        userinstitutionlink_out.access_token, me, institution_out
    )
    userinstitutionlink_in.cursor = userinstitutionlink_out.cursor
    userinstitutionlink_out = CRUDSyncableUserInstitutionLink.update(
        db,
        userinstitutionlink_out.id,
        userinstitutionlink_in,
        user_id=me.id,
        institution_id=institution_out.id,
    )
    for account_in in fetch_accounts(userinstitutionlink_out):
        account_out = CRUDSyncableAccount.read_by_plaid_id(
            db, account_in.institutionalaccount.plaid_id
        )
        print(account_out)
        account_out = CRUDSyncableAccount.update(db, account_out.id, account_in)
    return userinstitutionlink_out


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


@router.get("/{userinstitutionlink_id}")
def read(
    db: DBSession, me: CurrentUser, userinstitutionlink_id: int
) -> UserInstitutionLinkApiOut:
    return CRUDUser.read_user_institution_link(db, me.id, userinstitutionlink_id)


@router.get("/")
def read_many(db: DBSession, me: CurrentUser) -> Iterable[UserInstitutionLinkApiOut]:
    return CRUDUser.read_user_institution_links(db, me.id)


@router.put("/{userinstitutionlink_id}")
def update(
    db: DBSession,
    me: CurrentUser,
    userinstitutionlink_id: int,
    user_institution_link_in: UserInstitutionLinkApiIn,
) -> UserInstitutionLinkApiOut:
    curr_institution_link = CRUDUser.read_user_institution_link(
        db, me.id, userinstitutionlink_id
    )
    if curr_institution_link.is_synced:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return CRUDUserInstitutionLink.update(
        db, userinstitutionlink_id, user_institution_link_in
    )


@router.delete("/{userinstitutionlink_id}")
def delete(db: DBSession, me: CurrentUser, userinstitutionlink_id: int) -> int:
    CRUDUser.read_user_institution_link(db, me.id, userinstitutionlink_id)
    return CRUDUserInstitutionLink.delete(db, userinstitutionlink_id)


router.include_router(
    plaidtransactions.router,
    prefix="/{userinstitutionlink_id}/transactions/plaid",
    tags=["transactions"],
)
