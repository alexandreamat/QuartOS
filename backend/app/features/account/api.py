from __future__ import annotations
from datetime import datetime
from typing import Annotated, Iterable


from fastapi import APIRouter, HTTPException, status, UploadFile, File
from sqlalchemy.exc import NoResultFound

from app.database.deps import DBSession
from app.api import api_router

from app.features.user.deps import CurrentUser, CurrentSuperuser
from app.features import userinstitutionlink

from .crud import CRUDAccount
from .models import AccountApiOut, AccountApiIn

# Forward references, only for type annotations
from app.features.transaction.models import TransactionApiOut, TransactionApiIn

ACCOUNTS = "accounts"

router = APIRouter()


@router.post("/")
def create(
    db: DBSession,
    current_user: CurrentUser,
    account: AccountApiIn,
) -> AccountApiOut:
    if institutional_account := account.institutionalaccount:
        try:
            user = userinstitutionlink.crud.CRUDUserInstitutionLink.read_user(
                db, institutional_account.userinstitutionlink_id
            )
        except NoResultFound:
            raise HTTPException(status.HTTP_404_NOT_FOUND)
        if user.id != current_user.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN)
        if userinstitutionlink.crud.CRUDUserInstitutionLink.is_synced(
            db, institutional_account.userinstitutionlink_id
        ):
            raise HTTPException(status.HTTP_403_FORBIDDEN)
    if account.noninstitutionalaccount:
        account.noninstitutionalaccount.user_id = current_user.id
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


@router.get("/{id}/transactions")
def read_transactions(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    page: int = 1,
    per_page: int = 0,
    timestamp: datetime | None = None,
    search: str | None = None,
    is_descending: bool = True,
) -> Iterable[TransactionApiOut]:
    from app.features import transaction

    try:
        account = CRUDAccount.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if CRUDAccount.read_user(db, account.id).id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)

    return transaction.crud.CRUDTransaction.read_many_by_account(
        db, account.id, page, per_page, search, timestamp, is_descending
    )


@router.post("/{id}/transactions-sheet")
def upload_transactions_sheet(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    file: Annotated[UploadFile, File(...)],
) -> Iterable[TransactionApiIn]:
    from app.features import transaction

    try:
        user = CRUDAccount.read_user(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    if CRUDAccount.is_synced(db, id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    deserialiser = CRUDAccount.read_transaction_deserialiser(db, id)
    try:
        text_file = file.file.read().decode().splitlines()
        return transaction.utils.create_instances_from_csv(deserialiser, text_file, id)
    except Exception as e:
        exc_message = getattr(e, "message", str(e))
        error_message = f"{type(e).__name__}: {exc_message}"
        raise HTTPException(status.HTTP_400_BAD_REQUEST, error_message)


@router.get("/")
def read_many(db: DBSession, current_user: CurrentUser) -> Iterable[AccountApiOut]:
    yield from CRUDAccount.read_many_by_user(db, current_user.id)


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
    if institutional_account := account.institutionalaccount:
        try:
            user = userinstitutionlink.crud.CRUDUserInstitutionLink.read_user(
                db, institutional_account.userinstitutionlink_id
            )
        except NoResultFound:
            raise HTTPException(status.HTTP_404_NOT_FOUND)
        if user.id != current_user.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN)
    if account.noninstitutionalaccount:
        account.noninstitutionalaccount.user_id = current_user.id
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


@router.post("/update-balances")
def update_balances(db: DBSession, current_user: CurrentSuperuser) -> None:
    for account in CRUDAccount.read_many(db):
        CRUDAccount.update_balance(db, account.id)


api_router.include_router(router, prefix=f"/{ACCOUNTS}", tags=[ACCOUNTS])
