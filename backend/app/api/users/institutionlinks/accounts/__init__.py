from typing import Iterable

from fastapi import APIRouter

from app.database.deps import DBSession

from app.features.user import CurrentUser
from app.features.userinstitutionlink import (
    CRUDUserInstitutionLink,
    ForbiddenUserInstitutionLink,
    SyncedEntity,
)

from app.features.account import (
    CRUDAccount,
    AccountApiOut,
    AccountApiIn,
    ForbiddenAccount,
)

from . import transactions

router = APIRouter()


@router.post("/")
def create(
    db: DBSession,
    current_user: CurrentUser,
    account: AccountApiIn,
) -> AccountApiOut:
    if institutional_account := account.institutionalaccount:
        user_id = CRUDUserInstitutionLink.read_user_id(
            db, institutional_account.userinstitutionlink_id
        )
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


@router.get("/{account_id}")
def read(db: DBSession, current_user: CurrentUser, account_id: int) -> AccountApiOut:
    account = CRUDAccount.read(db, account_id)
    if CRUDAccount.read_user_id(db, account.id) != current_user.id:
        raise ForbiddenAccount()
    return account


@router.get("/")
def read_many(
    db: DBSession, current_user: CurrentUser, institution_link_id: int
) -> Iterable[AccountApiOut]:
    institution_link = CRUDUserInstitutionLink.read(db, institution_link_id)
    if current_user.id != institution_link.user_id:
        raise ForbiddenUserInstitutionLink
    return CRUDUserInstitutionLink.read_accounts(db, institution_link.id)


@router.put("/{account_id}")
def update(
    db: DBSession,
    current_user: CurrentUser,
    account_id: int,
    account: AccountApiIn,
) -> AccountApiOut:
    user_id = CRUDAccount.read_user_id(db, account_id)
    if user_id != current_user.id:
        raise ForbiddenAccount()
    if CRUDAccount.is_synced(db, account_id):
        raise SyncedEntity()
    if institutional_account := account.institutionalaccount:
        user_id = CRUDUserInstitutionLink.read_user_id(
            db, institutional_account.userinstitutionlink_id
        )
        if user_id != current_user.id:
            raise ForbiddenUserInstitutionLink()
    if account.noninstitutionalaccount:
        account.noninstitutionalaccount.user_id = current_user.id
    return CRUDAccount.update(db, account_id, account)


@router.delete("/{account_id}")
def delete(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
) -> None:
    user_id = CRUDAccount.read_user_id(db, id)
    if user_id != current_user.id:
        raise ForbiddenAccount()
    if CRUDAccount.is_synced(db, id):
        raise SyncedEntity()
    return CRUDAccount.delete(db, id)


router.include_router(
    transactions.router,
    prefix="/{account_id}/transactions",
    tags=["transactions"],
)
