from typing import Iterable

from fastapi import APIRouter

from app.database.deps import DBSession

from app.features.user import CurrentUser
from app.features.userinstitutionlink import SyncedEntity

from app.features.user import CRUDUser
from app.features.account import (
    CRUDAccount,
    AccountApiOut,
    AccountApiIn,
)

from . import movements
from . import transactions

router = APIRouter()


@router.post("/")
def create(
    db: DBSession,
    me: CurrentUser,
    userinstitutionlink_id: int,
    account_in: AccountApiIn,
) -> AccountApiOut:
    if account_in.institutionalaccount:
        user_institution_link = CRUDUser.read_user_institution_link(
            db, me.id, userinstitutionlink_id
        )
        if user_institution_link.plaid_id:
            raise SyncedEntity()
    return CRUDAccount.create(
        db, account_in, userinstitutionlink_id=userinstitutionlink_id, user_id=me.id
    )


@router.get("/{account_id}")
def read(
    db: DBSession, me: CurrentUser, userinstitutionlink_id: int, account_id: int
) -> AccountApiOut:
    return CRUDUser.read_account(
        db, me.id, userinstitutionlink_id=userinstitutionlink_id, account_id=account_id
    )


@router.get("/")
def read_many(
    db: DBSession, me: CurrentUser, userinstitutionlink_id: int
) -> Iterable[AccountApiOut]:
    return CRUDUser.read_accounts(db, me.id, userinstitutionlink_id)


@router.put("/{account_id}")
def update(
    db: DBSession,
    me: CurrentUser,
    userinstitutionlink_id: int,
    account_id: int,
    account_in: AccountApiIn,
    new_institution_link_id: int,
) -> AccountApiOut:
    if CRUDAccount.is_synced(db, account_id):
        raise SyncedEntity()
    CRUDUser.read_account(db, me.id, userinstitutionlink_id, account_id)
    return CRUDAccount.update(
        db, account_id, account_in, userinstitutionlink_id=new_institution_link_id
    )


@router.delete("/{account_id}")
def delete(
    db: DBSession,
    me: CurrentUser,
    userinstitutionlink_id: int,
    account_id: int,
) -> None:
    account_out = CRUDUser.read_account(db, me.id, userinstitutionlink_id, account_id)
    if account_out.is_synced:
        raise SyncedEntity()
    return CRUDAccount.delete(db, account_id)


router.include_router(
    transactions.router,
    prefix="/{account_id}/transactions",
    tags=["transactions"],
)

router.include_router(
    movements.router, prefix="/{account_id}/movements", tags=["movements"]
)
