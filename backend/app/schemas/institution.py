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

import logging
from typing import TYPE_CHECKING

from pydantic import HttpUrl, BaseModel
from pydantic_extra_types.color import Color

from app.schemas.common import (
    PlaidInMixin,
    CountryCode,
    PlaidOutMixin,
    SyncableApiOutMixin,
    ApiInMixin,
)

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)


class __InstitutionBase(BaseModel):
    name: str
    country_code: CountryCode
    url: HttpUrl | None
    colour: Color | None = None


class InstitutionApiOut(__InstitutionBase, SyncableApiOutMixin):
    logo_base64: str | None = None
    is_synced: bool
    transactiondeserialiser_id: int | None
    replacementpattern_id: int | None


class InstitutionApiIn(__InstitutionBase, ApiInMixin):
    url: HttpUrl
    logo_base64: str


class InstitutionPlaidOut(__InstitutionBase, PlaidOutMixin):
    logo: bytes | None


class InstitutionPlaidIn(__InstitutionBase, PlaidInMixin):
    logo: bytes | None
