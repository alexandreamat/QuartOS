from datetime import date
from typing import Iterable

from fastapi import APIRouter

from app.database.deps import DBSession

from app.features.user import CurrentUser, CRUDUser
from app.features.transaction import TransactionApiOut

router = APIRouter()


@router.get("/")
def read_many(
    db: DBSession,
    me: CurrentUser,
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
        None,
        account_id,
        None,
        page=page,
        per_page=per_page,
        search=search,
        timestamp=timestamp,
        is_descending=is_descending,
    )
