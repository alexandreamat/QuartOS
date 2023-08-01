from typing import Iterable

import urllib3
from fastapi import APIRouter, HTTPException, status

from app.database.deps import DBSession

from app.features.user import CRUDUser, CurrentUser
from app.features.userinstitutionlink import (
    CRUDUserInstitutionLink,
    CRUDSyncableUserInstitutionLink,
    UserInstitutionLinkApiOut,
    UserInstitutionLinkApiIn,
    sync_transactions,
)

from . import transactions

router = APIRouter()


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


@router.post("/{userinstitutionlink_id}/sync")
def sync(db: DBSession, me: CurrentUser, userinstitutionlink_id: int) -> None:
    curr_institution_link_out = CRUDUser.read_user_institution_link(
        db, me.id, userinstitutionlink_id
    )
    if not curr_institution_link_out.plaid_id:
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED)
    syncable_institution_link = CRUDSyncableUserInstitutionLink.read_by_plaid_id(
        db, curr_institution_link_out.plaid_id
    )
    replacement_pattern = CRUDUserInstitutionLink.read_replacement_pattern(
        db, syncable_institution_link.id
    )
    try:
        sync_transactions(db, syncable_institution_link, replacement_pattern)
    except urllib3.exceptions.ReadTimeoutError:
        raise HTTPException(status.HTTP_504_GATEWAY_TIMEOUT)


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
def delete(db: DBSession, me: CurrentUser, userinstitutionlink_id: int) -> None:
    CRUDUser.read_user_institution_link(db, me.id, userinstitutionlink_id)
    return CRUDUserInstitutionLink.delete(db, userinstitutionlink_id)


router.include_router(
    transactions.router,
    prefix="/{userinstitutionlink_id}/transactions",
    tags=["transactions"],
)
