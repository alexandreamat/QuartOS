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
from sqlalchemy import ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship

from app.models.common import SyncableBase, UrlType, ColorType
from app.models.replacementpattern import ReplacementPattern
from app.models.transactiondeserialiser import TransactionDeserialiser

if TYPE_CHECKING:
    from app.models.userinstitutionlink import UserInstitutionLink

logger = logging.getLogger(__name__)


class Institution(SyncableBase):
    __tablename__ = "institution"
    name: Mapped[str]
    country_code: Mapped[str]
    url: Mapped[HttpUrl | None] = mapped_column(type_=UrlType)
    colour: Mapped[Color | None] = mapped_column(type_=ColorType)
    logo: Mapped[bytes | None]
    transactiondeserialiser_id: Mapped[int | None] = mapped_column(
        ForeignKey("transactiondeserialiser.id")
    )
    replacementpattern_id: Mapped[int | None] = mapped_column(
        ForeignKey("replacementpattern.id")
    )

    user_links: Mapped[list["UserInstitutionLink"]] = relationship(
        back_populates="institution",
        cascade="all, delete",
    )
    transactiondeserialiser: Mapped[TransactionDeserialiser | None] = relationship(
        back_populates="institutions"
    )
    replacementpattern: Mapped[ReplacementPattern | None] = relationship()

    @property
    def logo_base64(self) -> str | None:
        return base64.b64encode(self.logo).decode() if self.logo else None

    @logo_base64.setter
    def logo_base64(self, value: str | None) -> None:
        self.logo = base64.b64decode(value.encode()) if value else None
