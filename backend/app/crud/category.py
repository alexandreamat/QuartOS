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

from typing import Generic

from app.crud.common import CRUDBase, InSchemaT, OutSchemaT
from app.models.category import Category
from app.schemas.category import (
    CategoryApiOut,
    CategoryApiIn,
    CategoryPlaidIn,
    CategoryPlaidOut,
)


class __CRUDCategoryBase(
    Generic[OutSchemaT, InSchemaT],
    CRUDBase[Category, OutSchemaT, InSchemaT],
):
    __model__ = Category


class CRUDCategory(
    __CRUDCategoryBase[CategoryApiOut, CategoryApiIn],
):
    __out_schema__ = CategoryApiOut


class CRUDSyncableCategory(__CRUDCategoryBase[CategoryPlaidOut, CategoryPlaidIn]):
    __out_schema__ = CategoryPlaidOut
