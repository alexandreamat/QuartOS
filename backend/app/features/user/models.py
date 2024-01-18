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
from typing import Any

from pydantic import EmailStr
from sqlalchemy.exc import NoResultFound
from sqlmodel import Relationship, SQLModel, Session, col, func, or_
from sqlmodel.sql.expression import SelectOfScalar
from sqlalchemy import select, case

from app.common.models import Base, CurrencyCode
from app.features.account import Account
from app.features.movement import Movement
from app.features.transaction import Transaction
from app.features.userinstitutionlink import UserInstitutionLink
from app.utils import verify_password, get_password_hash

logger = logging.getLogger(__name__)


class __UserBase(SQLModel):
    email: EmailStr
    full_name: str
    is_superuser: bool
    default_currency_code: CurrencyCode


class UserApiOut(__UserBase, Base):
    ...


class UserApiIn(__UserBase):
    password: str


class User(__UserBase, Base, table=True):
    hashed_password: str
    email: str

    institution_links: list[UserInstitutionLink] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )
    noninstitutionalaccounts: list[Account.NonInstitutionalAccount] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )

    @property
    def password(self) -> str:
        raise NotImplementedError

    @password.setter
    def password(self, value: str) -> None:
        self.hashed_password = get_password_hash(value)

    @classmethod
    def read_by_email(cls, db: Session, email: str) -> "User":
        db_user = db.exec(cls.select().where(cls.email == email)).first()
        if not db_user:
            raise NoResultFound
        return db_user

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
        statement = Account.select_accounts(account_id)

        if userinstitutionlink_id:
            statement = statement.where(
                UserInstitutionLink.id == userinstitutionlink_id
            )

        statement = statement.outerjoin(UserInstitutionLink).where(
            or_(
                Account.NonInstitutionalAccount.user_id == user_id,
                UserInstitutionLink.user_id == user_id,
            )
        )

        return statement

    @classmethod
    def select_movements(
        cls,
        user_id: int | None = None,
        userinstitutionlink_id: int | None = None,
        account_id: int | None = None,
        movement_id: int | None = None,
        **kwargs: Any,
    ) -> SelectOfScalar[Movement]:
        statement = Account.select_movements(account_id, movement_id, **kwargs)

        if userinstitutionlink_id:
            statement = statement.where(
                UserInstitutionLink.id == userinstitutionlink_id
            )

        statement = statement.outerjoin(UserInstitutionLink).where(
            or_(
                Account.NonInstitutionalAccount.user_id == user_id,
                UserInstitutionLink.user_id == user_id,
            )
        )
        return statement

    @classmethod
    def select_aggregates(
        cls,
        user_id: int,
        year: int | None = None,
        month: int | None = None,
        page: int = 0,
        per_page: int = 12,
    ) -> Any:
        movements_subquery = (
            select(
                col(Transaction.movement_id).label("id"),
                func.min(Transaction.timestamp).label("timestamp"),
                func.sum(Transaction.amount_default_currency).label("amount"),
            )
            .join(Account)
            .outerjoin(Account.InstitutionalAccount)
            .outerjoin(Account.NonInstitutionalAccount)
            .outerjoin(UserInstitutionLink)
            .outerjoin(User)
            .where(
                or_(
                    Account.NonInstitutionalAccount.user_id == user_id,
                    UserInstitutionLink.user_id == user_id,
                )
            )
            .group_by(col(Transaction.movement_id))
            .subquery()
        )

        aggregates_query = select(
            func.extract("year", movements_subquery.c.timestamp).label("year"),
            func.extract("month", movements_subquery.c.timestamp).label("month"),
            func.sum(
                case(
                    (
                        movements_subquery.c.amount < 0,
                        movements_subquery.c.amount,
                    ),
                    else_=0,
                )
            ).label("expenses"),
            func.sum(
                case(
                    (
                        movements_subquery.c.amount > 0,
                        movements_subquery.c.amount,
                    ),
                    else_=0,
                )
            ).label("income"),
        ).group_by("year", "month")

        if year:
            aggregates_query.where(aggregates_query.c.year == year)

        if month:
            aggregates_query.where(aggregates_query.c.month == month)

        if per_page:
            offset = page * per_page
            aggregates_query = aggregates_query.offset(offset).limit(per_page)

        return aggregates_query

    @classmethod
    def select_transactions(
        cls,
        user_id: int | None,
        userinstitutionlink_id: int | None,
        account_id: int | None,
        movement_id: int | None,
        transaction_id: int | None,
        **kwargs: Any,
    ) -> SelectOfScalar[Transaction]:
        statement = Account.select_transactions(
            account_id, movement_id, transaction_id, **kwargs
        )

        if userinstitutionlink_id is not None:
            statement = statement.where(
                UserInstitutionLink.id == userinstitutionlink_id
            )

        statement = statement.outerjoin(UserInstitutionLink).where(
            or_(
                Account.NonInstitutionalAccount.user_id == user_id,
                UserInstitutionLink.user_id == user_id,
            )
        )
        return statement
