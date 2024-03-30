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
from typing import Iterable

from fastapi import APIRouter

from app.crud.plstatement import CRUDPLStatement
from app.database.deps import DBSession
from app.deps.user import CurrentUser
from app.schemas.transactiongroup import DetailedPLStatementApiOut, PLStatementApiOut

router = APIRouter()


@router.get("/detailed/{timestamp__ge}/{timestamp__lt}")
def get_detailed_pl_statement(
    db: DBSession,
    me: CurrentUser,
    timestamp__ge: date,
    timestamp__lt: date,
) -> DetailedPLStatementApiOut:
    return CRUDPLStatement.get_detailed_pl_statement(
        db, user_id=me.id, timestamp__ge=timestamp__ge, timestamp__lt=timestamp__lt
    )


@router.get("/")
def get_many_pl_statements(
    db: DBSession,
    me: CurrentUser,
    bucket_id: int | None = None,
    page: int = 0,
    per_page: int = 12,
) -> Iterable[PLStatementApiOut]:
    return CRUDPLStatement.get_many_pl_statements(
        db, user_id=me.id, page=page, per_page=per_page, bucket_id=bucket_id
    )
