# Copyright (C) 2024 Alexandre Amat
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

from datetime import date
from decimal import Decimal
from typing import Iterable

from fastapi import APIRouter

from app.database.deps import DBSession
from app.features.movement import PLStatement, MovementApiOut, MovementField
from app.features.movement.models import DetailedPLStatementApiOut
from app.features.user import CurrentUser, CRUDUser

router = APIRouter()


@router.get("/{start_date}/{end_date}/expenses")
def read_expenses(
    db: DBSession,
    me: CurrentUser,
    start_date: date,
    end_date: date,
) -> Iterable[MovementApiOut]:
    return CRUDUser.read_movements(
        db,
        user_id=me.id,
        start_date=start_date,
        end_date=end_date,
        sort_by=MovementField.AMOUNT,
        is_descending=False,
        amount_lt=Decimal(0),
    )


@router.get("/{start_date}/{end_date}/income")
def read_income(
    db: DBSession,
    me: CurrentUser,
    start_date: date,
    end_date: date,
) -> Iterable[MovementApiOut]:
    return CRUDUser.read_movements(
        db,
        user_id=me.id,
        start_date=start_date,
        end_date=end_date,
        sort_by=MovementField.AMOUNT,
        is_descending=True,
        amount_gt=Decimal(0),
    )


@router.get("/detailed/{month}")
def get_detailed_pl_statement(
    db: DBSession,
    me: CurrentUser,
    month: date,
) -> DetailedPLStatementApiOut:
    return CRUDUser.get_detailed_pl_statement(db, me.id, month)


@router.get("/{month}")
def get_pl_statement(
    db: DBSession,
    me: CurrentUser,
    month: date,
) -> PLStatement:
    return CRUDUser.get_pl_statement(db, me.id, month)


@router.get("/")
def get_many_pl_statements(
    db: DBSession,
    me: CurrentUser,
    page: int = 0,
    per_page: int = 12,
) -> Iterable[PLStatement]:
    return CRUDUser.get_many_pl_statements(db, me.id, page=page, per_page=per_page)
