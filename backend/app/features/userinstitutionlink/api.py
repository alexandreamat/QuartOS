from __future__ import annotations
from typing import TYPE_CHECKING

from fastapi import APIRouter, HTTPException, status

from sqlalchemy.exc import NoResultFound, IntegrityError

from app.features.user.deps import CurrentUser
from app.database.deps import DBSession

from app.features.institution.crud import CRUDInstitution

from .crud import CRUDUserInstitutionLink
from .models import (
    UserInstitutionLinkApiOut,
    InstitutionLinkApiIn,
    UserInstitutionLinkApiIn,
)
from app.features.account.crud import CRUDAccount

# if TYPE_CHECKING:
from app.features.account.models import AccountApiOut

router = APIRouter()


@router.post("/")
def create(
    db: DBSession,
    current_user: CurrentUser,
    institution_link: InstitutionLinkApiIn,
) -> UserInstitutionLinkApiOut:
    try:
        CRUDInstitution.read(db, institution_link.institution_id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    user_institution_link = UserInstitutionLinkApiIn(
        **institution_link.dict(),
        user_id=current_user.id,
    )
    return CRUDUserInstitutionLink.create(db, user_institution_link)


@router.get("/{id}/accounts")
def read_accounts(
    db: DBSession, current_user: CurrentUser, id: int
) -> list[AccountApiOut]:
    try:
        institution_link = CRUDUserInstitutionLink.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    return CRUDAccount.read_many_by_institution_link(db, institution_link.id)


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
) -> list[UserInstitutionLinkApiOut]:
    return CRUDUserInstitutionLink.read_many_by_user(db, current_user.id)


@router.put("/{id}")
def update(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    institution_link: InstitutionLinkApiIn,
) -> UserInstitutionLinkApiOut:
    try:
        curr_institution_link = CRUDUserInstitutionLink.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if curr_institution_link.user_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    if CRUDUserInstitutionLink.is_synced(db, id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    new_institution_link = UserInstitutionLinkApiIn(
        **institution_link.dict(), user_id=current_user.id
    )
    try:
        return CRUDUserInstitutionLink.update(db, id, new_institution_link)
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
