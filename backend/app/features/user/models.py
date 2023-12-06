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

from typing import Any
from pydantic import EmailStr


from sqlalchemy.exc import NoResultFound
from sqlmodel import Relationship, SQLModel, Session, select, or_
from sqlmodel.sql.expression import SelectOfScalar

from app.common.models import ApiInMixin, ApiOutMixin, Base, CurrencyCode
from app.utils import verify_password

from app.features.userinstitutionlink import UserInstitutionLink
from app.features.account import Account
from app.features.transaction import Transaction
from app.features.movement import Movement
from app.features.accountacces.models import AccountAccess


class __UserBase(SQLModel):
    email: EmailStr
    full_name: str
    is_superuser: bool
    default_currency_code: CurrencyCode


class UserApiOut(__UserBase, ApiOutMixin):
    ...


class UserApiIn(__UserBase, ApiInMixin):
    password: str


class User(__UserBase, Base, table=True):
    hashed_password: str

    institution_links: list[UserInstitutionLink] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )
    accounts: list[Account] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )

    @classmethod
    def read_by_email(cls, db: Session, email: str) -> "User":
        return db.exec(select(cls).where(cls.email == email)).one()

    @classmethod
    def authenticate(cls, db: Session, email: str, password: str) -> "User":
        db_user = cls.read_by_email(db, email=email)
        assert db_user.hashed_password
        verify_password(password, db_user.hashed_password)
        return db_user

    @classmethod
    def select_user_institution_links(
        cls, user_id: int | None, userinstitutionlink_id: int | None
    ) -> SelectOfScalar[UserInstitutionLink]:
        statement = UserInstitutionLink.select_user_institution_links(
            userinstitutionlink_id
        )

        statement = statement.join(cls)
        if user_id:
            statement = statement.where(cls.id == user_id)

        return statement

    @classmethod
    def select_accounts(
        cls,
        user_id: int | None,
        userinstitutionlink_id: int | None,
        account_id: int | None,
    ) -> SelectOfScalar[Account]:
        statement = UserInstitutionLink.select_accounts(
            userinstitutionlink_id, account_id
        )

        statement = statement.outerjoin(
            cls,
            or_(cls.id == UserInstitutionLink.user_id, cls.id == AccountAccess.user_id),
        )
        if user_id:
            statement = statement.where(cls.id == user_id)

        return statement

    @classmethod
    def select_account_accesses(
        cls,
        user_id: int | None,
        userinstitutionlink_id: int | None,
        account_id: int | None,
        accountaccess_id: int | None,
    ) -> SelectOfScalar[AccountAccess]:
        statement = UserInstitutionLink.select_account_accesses(
            userinstitutionlink_id, account_id, accountaccess_id
        )

        statement = statement.outerjoin(
            cls,
            or_(cls.id == UserInstitutionLink.user_id, cls.id == AccountAccess.user_id),
        )
        if user_id:
            statement = statement.where(cls.id == user_id)

        return statement

    @classmethod
    def select_movements(
        cls,
        user_id: int | None,
        userinstitutionlink_id: int | None,
        account_id: int | None,
        accountaccess_id: int | None,
        movement_id: int | None,
        **kwargs: Any,
    ) -> SelectOfScalar[Movement]:
        statement = UserInstitutionLink.select_movements(
            userinstitutionlink_id, account_id, accountaccess_id, movement_id, **kwargs
        )

        statement = statement.outerjoin(
            cls,
            or_(cls.id == UserInstitutionLink.user_id, cls.id == AccountAccess.user_id),
        )
        if user_id:
            statement = statement.where(cls.id == user_id)

        return statement

    @classmethod
    def select_transactions(
        cls,
        user_id: int | None,
        userinstitutionlink_id: int | None,
        account_id: int | None,
        accountaccess_id: int | None,
        movement_id: int | None,
        transaction_id: int | None,
        **kwargs: Any,
    ) -> SelectOfScalar[Transaction]:
        statement = UserInstitutionLink.select_transactions(
            account_id,
            accountaccess_id,
            movement_id,
            transaction_id,
            **kwargs,
        )

        statement = statement.outerjoin(
            cls,
            or_(cls.id == UserInstitutionLink.user_id, cls.id == AccountAccess.user_id),
        )
        if user_id:
            statement = statement.where(cls.id == user_id)

        return statement
