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
    account_id: int | None = None,
    page: int = 0,
    per_page: int = 0,
    timestamp_ge: date | None = None,
    timestamp_le: date | None = None,
    search: str | None = None,
    is_descending: bool = True,
    amount_ge: Decimal | None = None,
    amount_le: Decimal | None = None,
    is_amount_abs: bool = False,
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
        timestamp_ge=timestamp_ge,
        timestamp_le=timestamp_le,
        is_descending=is_descending,
        amount_ge=amount_ge,
        amount_le=amount_le,
        is_amount_abs=is_amount_abs,
    )
