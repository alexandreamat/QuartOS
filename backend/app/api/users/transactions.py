from decimal import Decimal
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
    page: int = 0,
    per_page: int = 0,
    timestamp: date | None = None,
    search: str | None = None,
    is_descending: bool = True,
    amount_ge: Decimal | None = None,
    amount_le: Decimal | None = None,
) -> Iterable[TransactionApiOut]:
    return CRUDUser.read_transactions(
        db,
        me.id,
        None,
        None,
        None,
        page=page,
        per_page=per_page,
        search=search,
        timestamp=timestamp,
        is_descending=is_descending,
        amount_ge=amount_ge,
        amount_le=amount_le,
    )
