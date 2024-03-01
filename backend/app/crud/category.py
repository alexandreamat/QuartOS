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

from app.crud.common import CRUDBase, CRUDSyncedBase

from app.models.category import Category
from app.schemas.category import (
    CategoryApiOut,
    CategoryApiIn,
    CategoryPlaidIn,
    CategoryPlaidOut,
)


class CRUDCategory(
    CRUDBase[Category, CategoryApiOut, CategoryApiIn],
):
    db_model = Category
    out_model = CategoryApiOut


class CRUDSyncableCategory(CRUDSyncedBase[Category, CategoryPlaidOut, CategoryPlaidIn]):
    db_model = Category
    out_model = CategoryPlaidOut
