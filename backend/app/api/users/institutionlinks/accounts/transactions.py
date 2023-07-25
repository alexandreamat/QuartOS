from datetime import date
from typing import Annotated, Iterable


from fastapi import APIRouter, UploadFile, File

from app.database.deps import DBSession
from app.common.exceptions import UnknownError

from app.features.user import CurrentUser
from app.features.userinstitutionlink import SyncedEntity
from app.features.transaction import (
    TransactionApiOut,
    TransactionApiIn,
    get_transactions_from_csv,
)

from app.features.account import CRUDAccount, ForbiddenAccount

router = APIRouter()


@router.post("/upload-sheet")
def create(
    db: DBSession,
    current_user: CurrentUser,
    account_id: int,
    file: Annotated[UploadFile, File(...)],
) -> Iterable[TransactionApiIn]:
    user_id = CRUDAccount.read_user_id(db, account_id)
    if user_id != current_user.id:
        raise ForbiddenAccount()
    if CRUDAccount.is_synced(db, account_id):
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
    current_user: CurrentUser,
    account_id: int,
    page: int = 1,
    per_page: int = 0,
    timestamp: date | None = None,
    search: str | None = None,
    is_descending: bool = True,
) -> Iterable[TransactionApiOut]:
    account = CRUDAccount.read(db, account_id)
    if CRUDAccount.read_user_id(db, account.id) != current_user.id:
        raise ForbiddenAccount()
    return CRUDAccount.read_transactions(
        db, account.id, page, per_page, search, timestamp, is_descending
    )
