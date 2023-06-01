from typing import TYPE_CHECKING

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import NoResultFound

from app.features.user.deps import CurrentUser
from app.database.deps import DBSession


from .crud import CRUDAccount
from .models import AccountApiOut, AccountApiIn

from app.features.userinstitutionlink.crud import CRUDUserInstitutionLink

router = APIRouter()


@router.post("/")
def create(
    db: DBSession,
    current_user: CurrentUser,
    account: AccountApiIn,
) -> AccountApiOut:
    try:
        user = CRUDUserInstitutionLink.read_user(db, account.user_institution_link_id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    if CRUDUserInstitutionLink.is_synced(db, account.user_institution_link_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return CRUDAccount.create(db, account)


@router.get("/{id}")
def read(db: DBSession, current_user: CurrentUser, id: int) -> AccountApiOut:
    try:
        account = CRUDAccount.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if CRUDAccount.read_user(db, account.id).id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return account


@router.get("/")
def read_many(db: DBSession, current_user: CurrentUser) -> list[AccountApiOut]:
    return CRUDAccount.read_many_by_user(db, current_user.id)


@router.put("/{id}")
def update(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    account: AccountApiIn,
) -> AccountApiOut:
    try:
        user = CRUDAccount.read_user(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    if CRUDAccount.is_synced(db, id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    try:
        user = CRUDUserInstitutionLink.read_user(db, account.user_institution_link_id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return CRUDAccount.update(db, id, account)


@router.delete("/{id}")
def delete(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
) -> None:
    try:
        user = CRUDAccount.read_user(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    if CRUDAccount.is_synced(db, id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return CRUDAccount.delete(db, id)
