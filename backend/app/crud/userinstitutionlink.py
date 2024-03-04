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

from typing import Any, Generic

from sqlalchemy import Select

from app.crud.common import CRUDBase, InSchemaT, OutSchemaT
from app.models.user import User
from app.models.userinstitutionlink import (
    UserInstitutionLink,
)
from app.schemas.userinstitutionlink import (
    UserInstitutionLinkApiOut,
    UserInstitutionLinkApiIn,
    UserInstitutionLinkPlaidIn,
    UserInstitutionLinkPlaidOut,
)


class __CRUDUserInstitutionLinkBase(
    Generic[OutSchemaT, InSchemaT], CRUDBase[UserInstitutionLink, OutSchemaT, InSchemaT]
):
    __model__ = UserInstitutionLink

    @classmethod
    def select(
        cls, *, user_id: int | None = None, **kwargs: Any
    ) -> Select[tuple[UserInstitutionLink]]:
        statement = super().select(**kwargs)
        statement = statement.join(User)
        if user_id:
            statement = statement.where(User.id == user_id)
        return statement


class CRUDUserInstitutionLink(
    __CRUDUserInstitutionLinkBase[UserInstitutionLinkApiOut, UserInstitutionLinkApiIn],
):
    __out_schema__ = UserInstitutionLinkApiOut


class CRUDSyncableUserInstitutionLink(
    __CRUDUserInstitutionLinkBase[
        UserInstitutionLinkPlaidOut, UserInstitutionLinkPlaidIn
    ]
):
    __out_schema__ = UserInstitutionLinkPlaidOut
