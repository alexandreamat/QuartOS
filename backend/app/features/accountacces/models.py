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

from typing import Literal, TYPE_CHECKING, Any

from sqlmodel import SQLModel, Field, Relationship
from sqlmodel.sql.expression import SelectOfScalar

from app.common.models import Base

from app.features.movement import Movement
from app.features.transaction import Transaction


if TYPE_CHECKING:
    from app.features.userinstitutionlink import UserInstitutionLink
    from app.features.user import User
    from app.features.account import Account


class __AccountAccessBase(SQLModel):
    account_id: int
    type: bool


class InstitutionalAccountAccess(__AccountAccessBase):
    userinstitutionlink_id: int
    is_institutional: Literal[True]


class NonInstitutionalAccountAccess(__AccountAccessBase):
    user_id: int
    is_institutional: Literal[False]


class AccountAccess(Base, __AccountAccessBase, table=True):
    account_id: int = Field(foreign_key="account.id")
    account: "Account" = Relationship(back_populates="accesses")
    is_institutional: bool

    # Institutional
    userinstitutionlink_id: int | None = Field(foreign_key="userinstitutionlink.id")
    userinstitutionlink: "UserInstitutionLink | None" = Relationship(
        back_populates="accounts"
    )

    # NonInstitutional
    user_id: int | None = Field(foreign_key="user.id")
    _user: "User | None" = Relationship(back_populates="accounts")

    @property
    def user(self) -> User:
        if self.userinstitutionlink:
            return self.userinstitutionlink.user
        return self.user

    @classmethod
    def select_account_accesses(
        cls, accountaccess_id: int | None
    ) -> SelectOfScalar["AccountAccess"]:
        statement = cls.select()

        if accountaccess_id:
            statement = statement.where(cls.id == accountaccess_id)

        return statement

    @classmethod
    def select_movements(
        cls, accountaccess_id: int | None, movement_id: int | None, **kwargs: Any
    ) -> SelectOfScalar[Movement]:
        statement = Movement.select_movements(movement_id, **kwargs)

        if accountaccess_id:
            statement = statement.where(cls.id == accountaccess_id)

        return statement

    @classmethod
    def select_transactions(
        cls,
        accountaccess_id: int | None,
        movement_id: int | None,
        transaction_id: int | None,
        **kwargs: Any,
    ) -> SelectOfScalar[Transaction]:
        statement = Movement.select_transactions(movement_id, transaction_id, **kwargs)

        if accountaccess_id:
            statement = statement.where(cls.id == accountaccess_id)

        return statement
