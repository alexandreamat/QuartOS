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

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.account import InstitutionalAccount
from app.models.common import SyncableBase

if TYPE_CHECKING:
    from app.models.institution import Institution
    from app.models.user import User


class UserInstitutionLink(SyncableBase):
    __tablename__ = "user_institution_link"

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    institution_id: Mapped[int] = mapped_column(ForeignKey("institution.id"))
    access_token: Mapped[str | None]
    cursor: Mapped[str | None]

    user: Mapped["User"] = relationship()
    institution: Mapped["Institution"] = relationship(back_populates="user_links")
    institutionalaccounts: Mapped[list[InstitutionalAccount]] = relationship(
        back_populates="user_institution_link",
        cascade="all, delete",
    )
