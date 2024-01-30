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

from sqlmodel import Field, Relationship
from sqlmodel.sql.expression import SelectOfScalar

from app.common.models import SyncableBase
from app.features.account import Account

if TYPE_CHECKING:
    from app.features.institution import Institution
    from app.features.user import User


class UserInstitutionLink(SyncableBase, table=True):
    user_id: int = Field(foreign_key="user.id")
    institution_id: int = Field(foreign_key="institution.id")
    access_token: str | None
    cursor: str | None

    user: "User" = Relationship(back_populates="institution_links")
    institution: "Institution" = Relationship(back_populates="user_links")
    institutionalaccounts: list[Account.InstitutionalAccount] = Relationship(
        back_populates="userinstitutionlink",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )

    @classmethod
    def select_user_institution_links(
        cls, userinstitutionlink_id: int | None
    ) -> SelectOfScalar["UserInstitutionLink"]:
        statement = cls.select()

        statement = statement.outerjoin(cls)
        if userinstitutionlink_id:
            statement = statement.where(cls.id == userinstitutionlink_id)

        return statement

    @classmethod
    def select_accounts(
        cls, userinstitutionlink_id: int | None, account_id: int | None
    ) -> SelectOfScalar[Account]:
        statement = Account.select_accounts(account_id)

        statement = statement.outerjoin(cls)
        if userinstitutionlink_id:
            statement = statement.where(cls.id == userinstitutionlink_id)

        return statement

    @property
    def is_synced(self) -> bool:
        return self.access_token != None
