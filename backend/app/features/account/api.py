from typing import Annotated


from fastapi import APIRouter, HTTPException, status, UploadFile, File
from sqlalchemy.exc import NoResultFound

from app.features.user.deps import CurrentUser
from app.database.deps import DBSession


from .crud import CRUDAccount
from .models import AccountApiOut, AccountApiIn

from app.features.userinstitutionlink.crud import CRUDUserInstitutionLink

from app.features import transaction

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


@router.post("/{id}/transactions-sheet")
def upload_transactions_sheet(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    file: Annotated[UploadFile, File(...)],
) -> list[transaction.models.TransactionApiIn]:
    try:
        user = CRUDAccount.read_user(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    if CRUDAccount.is_synced(db, id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    try:
        text_file = file.file.read().decode().splitlines()
        return transaction.utils.create_instances_from_csv(text_file, id)
    except Exception as e:
        exc_message = getattr(e, "message", str(e))
        error_message = f"{type(e).__name__}: {exc_message}"
        raise HTTPException(status.HTTP_400_BAD_REQUEST, error_message)


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
