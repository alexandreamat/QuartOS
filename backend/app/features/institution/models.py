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

import base64
import logging
from typing import TYPE_CHECKING

from pydantic import HttpUrl
from pydantic_extra_types.color import Color
from sqlmodel import Relationship, SQLModel, Field

from app.common.models import (
    PlaidInMixin,
    CountryCode,
    SyncableBase,
    PlaidOutMixin,
    SyncableApiOutMixin,
    ApiInMixin,
)
from app.common.models import UrlType, ColorType
from app.features.replacementpattern import ReplacementPattern
from app.features.transactiondeserialiser import TransactionDeserialiser

if TYPE_CHECKING:
    from app.features.userinstitutionlink import UserInstitutionLink

logger = logging.getLogger(__name__)


class __InstitutionBase(SQLModel):
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


class Institution(__InstitutionBase, SyncableBase, table=True):
    url: HttpUrl | None = Field(sa_type=UrlType)
    colour: Color | None = Field(sa_type=ColorType)
    logo: bytes | None
    transactiondeserialiser_id: int | None = Field(
        foreign_key="transactiondeserialiser.id"
    )
    replacementpattern_id: int | None = Field(foreign_key="replacementpattern.id")

    user_links: list["UserInstitutionLink"] = Relationship(
        back_populates="institution",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )
    transactiondeserialiser: TransactionDeserialiser | None = Relationship(
        back_populates="institutions"
    )
    replacementpattern: ReplacementPattern | None = Relationship()

    @property
    def is_synced(self) -> bool:
        return self.plaid_id is not None

    @property
    def logo_base64(self) -> str | None:
        return base64.b64encode(self.logo).decode() if self.logo else None

    @logo_base64.setter
    def logo_base64(self, value: str | None) -> None:
        self.logo = base64.b64decode(value.encode()) if value else None
