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
from app.models.institution import Institution
from app.schemas.institution import (
    InstitutionApiOut,
    InstitutionApiIn,
    InstitutionPlaidIn,
    InstitutionPlaidOut,
)


class __CRUDInstitutionBase(
    Generic[OutSchemaT, InSchemaT], CRUDBase[Institution, OutSchemaT, InSchemaT]
):
    __model__ = Institution


class CRUDInstitution(
    __CRUDInstitutionBase[InstitutionApiOut, InstitutionApiIn],
):
    __out_model__ = InstitutionApiOut


class CRUDSyncableInstitution(
    __CRUDInstitutionBase[InstitutionPlaidOut, InstitutionPlaidIn],
):
    __out_model__ = InstitutionPlaidOut
