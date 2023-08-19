from typing import Annotated, Iterable

from fastapi import APIRouter, UploadFile, File

from app.database.deps import DBSession
from app.common.exceptions import UnknownError

from app.features.user import CRUDUser, CurrentUser
from app.features.userinstitutionlink import SyncedEntity
from app.features.account import (
    CRUDAccount,
    AccountApiOut,
    AccountApiIn,
)
from app.features.transaction import (
    TransactionApiIn,
    get_transactions_from_csv,
)

from . import movements
from . import transactions

router = APIRouter()


@router.get("/")
def read_many(db: DBSession, me: CurrentUser) -> Iterable[AccountApiOut]:
    return CRUDUser.read_accounts(db, me.id, None)


@router.post("/preview")
def preview(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    file: Annotated[UploadFile, File(...)],
) -> Iterable[TransactionApiIn]:
    CRUDUser.read_account(db, me.id, None, account_id)
    deserialiser = CRUDAccount.read_transaction_deserialiser(db, account_id)
    try:
        yield from get_transactions_from_csv(deserialiser, file.file, account_id)
    except Exception as e:
        raise UnknownError(e)


@router.post("/")
def create(
    db: DBSession,
    me: CurrentUser,
    account_in: AccountApiIn,
    userinstitutionlink_id: int | None = None,
) -> AccountApiOut:
    if account_in.institutionalaccount and userinstitutionlink_id:
        CRUDUser.read_user_institution_link(db, me.id, userinstitutionlink_id)
    return CRUDAccount.create(
        db, account_in, userinstitutionlink_id=userinstitutionlink_id, user_id=me.id
    )


@router.get("/{account_id}")
def read(db: DBSession, me: CurrentUser, account_id: int) -> AccountApiOut:
    return CRUDUser.read_account(db, me.id, None, account_id=account_id)


@router.put("/{account_id}/update-balance")
def update_balances(db: DBSession, me: CurrentUser, account_id: int) -> AccountApiOut:
    CRUDUser.read_account(db, me.id, None, account_id)
    return CRUDAccount.update_balance(db, account_id)


@router.put("/{account_id}")
def update(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    account_in: AccountApiIn,
    userinstitutionlink_id: int | None,
) -> AccountApiOut:
    if CRUDAccount.is_synced(db, account_id):
        raise SyncedEntity()
    CRUDUser.read_account(db, me.id, None, account_id)
    return CRUDAccount.update(
        db,
        account_id,
        account_in,
        userinstitutionlink_id=userinstitutionlink_id,
        user_id=me.id,
    )


@router.delete("/{account_id}")
def delete(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
) -> None:
    account_out = CRUDUser.read_account(db, me.id, None, account_id)
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
