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


from typing import Iterable
from fastapi import APIRouter

from app.database.deps import DBSession
from app.features.category import (
    CRUDCategory,
    CategoryApiOut,
)
from app.features.category.plaid import get_all_plaid_categories
from app.features.user.deps import CurrentSuperuser, CurrentUser

router = APIRouter()


@router.get("/")
def read_many(db: DBSession, me: CurrentUser) -> Iterable[CategoryApiOut]:
    return CRUDCategory.read_many(db, 0, 0)


@router.get("/{category_id}")
def read(db: DBSession, category_id: int) -> CategoryApiOut:
    return CRUDCategory.read(db, category_id)


@router.put("/plaid/get-all")
def get_all(db: DBSession, me: CurrentSuperuser) -> None:
    get_all_plaid_categories(db)
