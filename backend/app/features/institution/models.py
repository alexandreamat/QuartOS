# Copyright (C) 2023 Alexandre Amat
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

from typing import TYPE_CHECKING, Annotated, Any
import base64

from pydantic import HttpUrl, validator, constr
from sqlmodel import Relationship, SQLModel, Field
import pycountry

from app.common.models import (
    PlaidInMixin,
    SyncableBase,
    PlaidOutMixin,
    SyncableApiOutMixin,
    ApiInMixin,
)
from app.features.transactiondeserialiser import TransactionDeserialiser
from app.features.replacementpattern import ReplacementPattern

if TYPE_CHECKING:
    from app.features.userinstitutionlink import UserInstitutionLink


class __InstitutionBase(SQLModel):
    name: str
    country_code: str
    url: HttpUrl | None
    colour: Annotated[str, constr(regex=r"^#[0-9a-fA-F]{6}$")] | None

    @validator("country_code")
    def country_code_must_exist(cls, value: str) -> str:
        if value not in [country.alpha_2 for country in pycountry.countries]:
            raise ValueError("Invalid country code")
        return value


class InstitutionApiOut(__InstitutionBase, SyncableApiOutMixin):
    logo_base64: str | None
    is_synced: bool
    transactiondeserialiser_id: int | None
    replacementpattern_id: int | None

    @classmethod
    def from_orm(
        cls, obj: Any, update: dict[str, Any] | None = None
    ) -> "InstitutionApiOut":
        m = super().from_orm(obj, update)
        if obj.logo:
            m.logo_base64 = base64.b64encode(obj.logo).decode()
        return m


class InstitutionApiIn(__InstitutionBase, ApiInMixin):
    url: HttpUrl


class InstitutionPlaidOut(__InstitutionBase, PlaidOutMixin):
    logo: bytes | None


class InstitutionPlaidIn(__InstitutionBase, PlaidInMixin):
    logo: bytes | None


class Institution(__InstitutionBase, SyncableBase, table=True):
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
