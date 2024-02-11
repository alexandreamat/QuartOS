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

from sqlalchemy import ForeignKey, Select
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.common.models import SyncableBase
from app.features.account import Account

if TYPE_CHECKING:
    from app.features.institution import Institution
    from app.features.user import User


class UserInstitutionLink(SyncableBase):
    __tablename__ = "userinstitutionlink"

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    institution_id: Mapped[int] = mapped_column(ForeignKey("institution.id"))
    access_token: Mapped[str | None]
    cursor: Mapped[str | None]

    user: Mapped["User"] = relationship(back_populates="institution_links")
    institution: Mapped["Institution"] = relationship(back_populates="user_links")
    institutionalaccounts: Mapped[list[Account.InstitutionalAccount]] = relationship(
        back_populates="userinstitutionlink",
        cascade="all, delete",
    )

    @classmethod
    def select_accounts(
        cls, userinstitutionlink_id: int | None, account_id: int | None
    ) -> Select[tuple[Account]]:
        statement = Account.select_accounts(account_id)

        statement = statement.outerjoin(cls)
        if userinstitutionlink_id:
            statement = statement.where(cls.id == userinstitutionlink_id)

        return statement

    @property
    def is_synced(self) -> bool:
        return self.access_token != None
