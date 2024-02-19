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
from typing import TYPE_CHECKING

from pydantic import BaseModel

from app.schemas.common import (
    ApiInMixin,
    PlaidInMixin,
    PlaidOutMixin,
    SyncableApiOutMixin,
)

if TYPE_CHECKING:
    pass


class __UserInstitutionLinkBase(BaseModel):
    ...


class __SyncedUserInstitutionLinkBase(__UserInstitutionLinkBase):
    access_token: str
    cursor: str | None = None


class UserInstitutionLinkApiIn(__UserInstitutionLinkBase, ApiInMixin):
    ...


class UserInstitutionLinkApiOut(__UserInstitutionLinkBase, SyncableApiOutMixin):
    institution_id: int
    user_id: int


class UserInstitutionLinkPlaidIn(__SyncedUserInstitutionLinkBase, PlaidInMixin):
    ...


class UserInstitutionLinkPlaidOut(__SyncedUserInstitutionLinkBase, PlaidOutMixin):
    institution_id: int
    user_id: int
