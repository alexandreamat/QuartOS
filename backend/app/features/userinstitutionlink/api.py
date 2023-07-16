from typing import Iterable
from datetime import date

import urllib3
from fastapi import APIRouter, HTTPException, status

from sqlalchemy.exc import NoResultFound, IntegrityError

from app.database.deps import DBSession
from app.api import api_router

from app.features.institution import CRUDInstitution
from app.features.user import CRUDUser, CurrentUser, CurrentSuperuser
from app.features.account import AccountApiOut
from app.features.transaction import (
    TransactionPlaidIn,
    TransactionPlaidOut,
    reset_transaction_to_metadata,
)

from .crud import CRUDUserInstitutionLink, CRUDSyncableUserInstitutionLink
from .models import (
    UserInstitutionLinkApiOut,
    UserInstitutionLinkApiIn,
)
from .plaid import fetch_transactions, sync_transactions


INSTITUTION_LINKS = "institution-links"

router = APIRouter()


@router.post("/")
def create(
    db: DBSession,
    current_user: CurrentUser,
    user_institution_link: UserInstitutionLinkApiIn,
) -> UserInstitutionLinkApiOut:
    try:
        CRUDInstitution.read(db, user_institution_link.institution_id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    user_institution_link.user_id = current_user.id
    return CRUDUserInstitutionLink.create(db, user_institution_link)


@router.get("/{id}/accounts")
def read_accounts(
    db: DBSession, current_user: CurrentUser, id: int
) -> Iterable[AccountApiOut]:
    try:
        institution_link = CRUDUserInstitutionLink.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    return CRUDUserInstitutionLink.read_accounts(db, institution_link.id)


@router.get("/{id}")
def read(
    db: DBSession, current_user: CurrentUser, id: int
) -> UserInstitutionLinkApiOut:
    try:
        institution_link = CRUDUserInstitutionLink.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if institution_link.user_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return institution_link


@router.get("/")
def read_many(
    db: DBSession, current_user: CurrentUser
) -> Iterable[UserInstitutionLinkApiOut]:
    return CRUDUser.read_user_institution_links(db, current_user.id)


@router.put("/{id}")
def update(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    user_institution_link: UserInstitutionLinkApiIn,
) -> UserInstitutionLinkApiOut:
    try:
        curr_institution_link = CRUDUserInstitutionLink.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if curr_institution_link.user_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    if curr_institution_link.is_synced:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    user_institution_link.user_id = current_user.id
    try:
        return CRUDUserInstitutionLink.update(db, id, user_institution_link)
    except IntegrityError:
        raise HTTPException(status.HTTP_404_NOT_FOUND)


@router.delete("/{id}")
def delete(db: DBSession, current_user: CurrentUser, id: int) -> None:
    try:
        curr_institution_link = CRUDUserInstitutionLink.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if curr_institution_link.user_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return CRUDUserInstitutionLink.delete(db, id)


@router.post("/plaid/{id}/sync")
def sync(db: DBSession, current_user: CurrentUser, id: int) -> None:
    try:
        curr_institution_link = CRUDUserInstitutionLink.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
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


@router.get("/plaid/{id}/transactions/{start_date}/{end_date}")
def read_many_plaid_transactions(
    db: DBSession,
    current_user: CurrentSuperuser,
    id: int,
    start_date: date,
    end_date: date,
) -> Iterable[TransactionPlaidIn]:
    user_institution_link = CRUDSyncableUserInstitutionLink.read(db, id)
    return fetch_transactions(db, user_institution_link, start_date, end_date)


@router.put("/plaid/{id}/transactions/reset")
def reset_transactions_plaid(
    db: DBSession, current_user: CurrentSuperuser, id: int
) -> Iterable[TransactionPlaidOut]:
    for t in CRUDSyncableUserInstitutionLink.read_transactions(db, id):
        yield reset_transaction_to_metadata(db, t.id)


api_router.include_router(
    router, prefix=f"/{INSTITUTION_LINKS}", tags=[INSTITUTION_LINKS]
)
