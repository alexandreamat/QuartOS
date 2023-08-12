from typing import Iterable
from datetime import date
from decimal import Decimal

from fastapi import APIRouter

from app.database.deps import DBSession
from app.common.models import CurrencyCode

from app.features.user import CurrentUser, CRUDUser
from app.features.movement import PLStatement, MovementApiOut, MovementField

router = APIRouter()


@router.get("/{start_date}/{end_date}/expenses")
def read_expenses(
    db: DBSession,
    me: CurrentUser,
    start_date: date,
    end_date: date,
    currency_code: CurrencyCode,
) -> Iterable[MovementApiOut]:
    return CRUDUser.read_movements(
        db,
        user_id=me.id,
        start_date=start_date,
        end_date=end_date,
        sort_by=MovementField.AMOUNT,
        is_descending=False,
        amount_lt=Decimal(0),
        currency_code=currency_code,
    )


@router.get("/{start_date}/{end_date}/income")
def read_income(
    db: DBSession,
    me: CurrentUser,
    start_date: date,
    end_date: date,
    currency_code: CurrencyCode,
) -> Iterable[MovementApiOut]:
    return CRUDUser.read_movements(
        db,
        user_id=me.id,
        start_date=start_date,
        end_date=end_date,
        sort_by=MovementField.AMOUNT,
        is_descending=True,
        amount_gt=Decimal(0),
        currency_code=currency_code,
    )


@router.get("/{start_date}/{end_date}")
def get_aggregate(
    db: DBSession,
    me: CurrentUser,
    start_date: date,
    end_date: date,
    currency_code: CurrencyCode,
) -> PLStatement:
    return CRUDUser.get_movement_aggregate(
        db,
        me.id,
        start_date=start_date,
        end_date=end_date,
        currency_code=currency_code,
    )


@router.get("/")
def get_many_aggregates(
    db: DBSession,
    me: CurrentUser,
    currency_code: CurrencyCode,
    page: int = 0,
    per_page: int = 12,
) -> Iterable[PLStatement]:
    return CRUDUser.get_many_movement_aggregates(
        db, me.id, page=page, per_page=per_page, currency_code=currency_code
    )
