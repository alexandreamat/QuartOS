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
    ForbiddenUserInstitutionLink,
)

from . import accounts
from . import transactions

router = APIRouter()


@router.post("/")
def create(
    db: DBSession,
    current_user: CurrentUser,
    user_institution_link: UserInstitutionLinkApiIn,
) -> UserInstitutionLinkApiOut:
    return CRUDUserInstitutionLink.create(db, user_institution_link)


@router.post("/{institution_link_id}/sync")
def sync(db: DBSession, current_user: CurrentUser, institution_link_id: int) -> None:
    curr_institution_link = CRUDUserInstitutionLink.read(db, institution_link_id)
    if curr_institution_link.user_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    if not curr_institution_link.plaid_id:
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED)
    syncable_institution_link = CRUDSyncableUserInstitutionLink.read_by_plaid_id(
        db, curr_institution_link.plaid_id
    )
    try:
        sync_transactions(db, syncable_institution_link)
    except urllib3.exceptions.ReadTimeoutError:
        raise HTTPException(status.HTTP_504_GATEWAY_TIMEOUT)


@router.get("/{institution_link_id}")
def read(
    db: DBSession, current_user: CurrentUser, institution_link_id: int
) -> UserInstitutionLinkApiOut:
    institution_link = CRUDUserInstitutionLink.read(db, institution_link_id)
    if institution_link.user_id != current_user.id:
        raise ForbiddenUserInstitutionLink
    return institution_link


@router.get("/")
def read_many(
    db: DBSession, current_user: CurrentUser
) -> Iterable[UserInstitutionLinkApiOut]:
    return CRUDUser.read_user_institution_links(db, current_user.id)


@router.put("/{institution_link_id}")
def update(
    db: DBSession,
    current_user: CurrentUser,
    institution_link_id: int,
    user_institution_link: UserInstitutionLinkApiIn,
) -> UserInstitutionLinkApiOut:
    curr_institution_link = CRUDUserInstitutionLink.read(db, institution_link_id)
    if curr_institution_link.user_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    if curr_institution_link.is_synced:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return CRUDUserInstitutionLink.update(
        db, institution_link_id, user_institution_link
    )


@router.delete("/{institution_link_id}")
def delete(db: DBSession, current_user: CurrentUser, institution_link_id: int) -> None:
    curr_institution_link = CRUDUserInstitutionLink.read(db, institution_link_id)
    if curr_institution_link.user_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return CRUDUserInstitutionLink.delete(db, institution_link_id)


router.include_router(
    accounts.router,
    prefix="/{institution_link_id}/accounts",
    tags=["accounts"],
)
router.include_router(
    transactions.router,
    prefix="/{institution_link_id}/transactions",
    tags=["transactions"],
)
