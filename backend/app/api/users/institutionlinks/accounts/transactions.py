from datetime import date
from typing import Annotated, Iterable

from fastapi import APIRouter, UploadFile, File

from app.database.deps import DBSession
from app.common.exceptions import UnknownError

from app.features.user import CurrentUser, CRUDUser
from app.features.userinstitutionlink import SyncedEntity
from app.features.account import CRUDAccount
from app.features.transaction import (
    TransactionApiOut,
    TransactionApiIn,
    get_transactions_from_csv,
)

router = APIRouter()


@router.get("/preview")
def preview(
    db: DBSession,
    me: CurrentUser,
    userinstitutionlink_id: int,
    account_id: int,
    file: Annotated[UploadFile, File(...)],
) -> Iterable[TransactionApiIn]:
    account_out = CRUDUser.read_account(db, me.id, userinstitutionlink_id, account_id)
    if account_out.is_synced:
        raise SyncedEntity()
    deserialiser = CRUDAccount.read_transaction_deserialiser(db, account_id)
    try:
        text_file = file.file.read().decode().splitlines()
        return get_transactions_from_csv(deserialiser, text_file, account_id)
    except Exception as e:
        raise UnknownError(e)


@router.get("/")
def read_many(
    db: DBSession,
    me: CurrentUser,
    userinstitutionlink_id: int,
    account_id: int,
    page: int = 1,
    per_page: int = 0,
    timestamp: date | None = None,
    search: str | None = None,
    is_descending: bool = True,
) -> Iterable[TransactionApiOut]:
    return CRUDUser.read_transactions(
        db,
        me.id,
        userinstitutionlink_id,
        account_id,
        None,
        page=page,
        per_page=per_page,
        search=search,
        timestamp=timestamp,
        is_descending=is_descending,
    )
