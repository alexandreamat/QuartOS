from datetime import date
from typing import Annotated, Iterable


from fastapi import APIRouter, UploadFile, File
from sqlalchemy.exc import NoResultFound

from app.database.deps import DBSession
from app.api import api_router
from app.common.exceptions import UnknownError

from app.features.user import CRUDUser, CurrentUser, CurrentSuperuser
from app.features.userinstitutionlink import (
    CRUDUserInstitutionLink,
    UserInstitutionLinkNotFound,
    ForbiddenUserInstitutionLink,
    SyncedEntity,
)
from app.features.transaction import get_transactions_from_csv

from .crud import CRUDAccount
from .models import AccountApiOut, AccountApiIn
from .exceptions import AccountNotFound, ForbiddenAccount

from app.features.transaction import (
    TransactionApiOut,
    TransactionApiIn,
)

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
            user_id = CRUDUserInstitutionLink.read_user_id(
                db, institutional_account.userinstitutionlink_id
            )
        except NoResultFound:
            raise AccountNotFound()
        if user_id != current_user.id:
            raise ForbiddenAccount()
        user_institution_link = CRUDUserInstitutionLink.read(
            db, institutional_account.userinstitutionlink_id
        )
        if user_institution_link.plaid_id:
            raise SyncedEntity()
    if account.noninstitutionalaccount:
        account.noninstitutionalaccount.user_id = current_user.id
    return CRUDAccount.create(db, account)


@router.get("/{id}")
def read(db: DBSession, current_user: CurrentUser, id: int) -> AccountApiOut:
    try:
        account = CRUDAccount.read(db, id)
    except NoResultFound:
        raise AccountNotFound()
    if CRUDAccount.read_user_id(db, account.id) != current_user.id:
        raise ForbiddenAccount()
    return account


@router.get("/{id}/transactions")
def read_transactions(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    page: int = 1,
    per_page: int = 0,
    timestamp: date | None = None,
    search: str | None = None,
    is_descending: bool = True,
) -> Iterable[TransactionApiOut]:
    try:
        account = CRUDAccount.read(db, id)
    except NoResultFound:
        raise AccountNotFound()
    if CRUDAccount.read_user_id(db, account.id) != current_user.id:
        raise ForbiddenAccount()
    return CRUDAccount.read_transactions(
        db, account.id, page, per_page, search, timestamp, is_descending
    )


@router.post("/{id}/transactions-sheet")
def upload_transactions_sheet(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    file: Annotated[UploadFile, File(...)],
) -> Iterable[TransactionApiIn]:
    try:
        user_id = CRUDAccount.read_user_id(db, id)
    except NoResultFound:
        raise AccountNotFound()
    if user_id != current_user.id:
        raise ForbiddenAccount()
    if CRUDAccount.is_synced(db, id):
        raise SyncedEntity()
    deserialiser = CRUDAccount.read_transaction_deserialiser(db, id)
    try:
        text_file = file.file.read().decode().splitlines()
        return get_transactions_from_csv(deserialiser, text_file, id)
    except Exception as e:
        raise UnknownError(e)


@router.get("/")
def read_many(db: DBSession, current_user: CurrentUser) -> Iterable[AccountApiOut]:
    return CRUDUser.read_accounts(db, current_user.id)


@router.put("/{id}")
def update(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    account: AccountApiIn,
) -> AccountApiOut:
    try:
        user_id = CRUDAccount.read_user_id(db, id)
    except NoResultFound:
        raise AccountNotFound()
    if user_id != current_user.id:
        raise ForbiddenAccount()
    if CRUDAccount.is_synced(db, id):
        raise SyncedEntity()
    if institutional_account := account.institutionalaccount:
        try:
            user_id = CRUDUserInstitutionLink.read_user_id(
                db, institutional_account.userinstitutionlink_id
            )
        except NoResultFound:
            raise UserInstitutionLinkNotFound()
        if user_id != current_user.id:
            raise ForbiddenUserInstitutionLink()
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
        user_id = CRUDAccount.read_user_id(db, id)
    except NoResultFound:
        raise AccountNotFound()
    if user_id != current_user.id:
        raise ForbiddenAccount()
    if CRUDAccount.is_synced(db, id):
        raise SyncedEntity()
    return CRUDAccount.delete(db, id)


@router.post("/update-balances")
def update_balances(db: DBSession, current_user: CurrentSuperuser) -> None:
    for account in CRUDAccount.read_many(db, 0, 0):
        CRUDAccount.update_balance(db, account.id)


api_router.include_router(router, prefix=f"/{ACCOUNTS}", tags=[ACCOUNTS])
