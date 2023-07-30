from typing import Iterable, Any
from pydantic import EmailStr
from datetime import date
from dateutil.relativedelta import relativedelta


from sqlalchemy.exc import NoResultFound
from sqlmodel import Relationship, SQLModel, Session, select, update
from sqlmodel.sql.expression import SelectOfScalar

from app.common.models import Base
from app.utils import verify_password

from app.features.userinstitutionlink import UserInstitutionLink
from app.features.account import Account
from app.features.transaction import Transaction
from app.features.movement import Movement, PLStatement


class __UserBase(SQLModel):
    email: EmailStr
    full_name: str
    is_superuser: bool


class UserApiOut(__UserBase, Base):
    ...


class UserApiIn(__UserBase):
    password: str


class User(__UserBase, Base, table=True):
    hashed_password: str

    institution_links: list[UserInstitutionLink] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )
    noninstitutionalaccounts: list[Account.NonInstitutionalAccount] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )

    @classmethod
    def read_by_email(cls, db: Session, email: str) -> "User":
        db_user = db.exec(select(cls).where(cls.email == email)).first()
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
        statement = UserInstitutionLink.select_accounts(
            account_id, userinstitutionlink_id
        )

        statement = statement.join(cls)
        if user_id:
            statement = statement.where(cls.id == user_id)

        return statement

    @classmethod
    def select_movements(
        cls,
        user_id: int | None,
        userinstitutionlink_id: int | None,
        account_id: int | None,
        movement_id: int | None,
        **kwargs: Any,
    ) -> SelectOfScalar[Movement]:
        statement = UserInstitutionLink.select_movements(
            userinstitutionlink_id, account_id, movement_id, **kwargs
        )

        statement = statement.join(cls)
        if user_id:
            statement = statement.where(cls.id == user_id)

        return statement

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
        statement = UserInstitutionLink.select_transactions(
            userinstitutionlink_id, account_id, movement_id, transaction_id, **kwargs
        )
        statement = statement.join(cls)
        if user_id:
            statement = statement.where(cls.id == user_id)

        return statement

    @classmethod
    def get_movement_aggregate(
        cls, db: Session, user_id: int, *args: Any, **kwargs: Any
    ) -> PLStatement:
        statement = cls.select_movements(user_id, None, None, None)
        return Movement.get_aggregate(db, statement, *args, **kwargs)

    @classmethod
    def get_many_movement_aggregates(
        cls, db: Session, id: int, page: int, per_page: int, *args: Any, **kwargs: Any
    ) -> Iterable[PLStatement]:
        today = date.today()
        last_start_date = today.replace(day=1)
        offset = per_page * page
        for i in range(offset, offset + per_page):
            start_date = last_start_date - relativedelta(months=i)
            end_date = min(start_date + relativedelta(months=1), today)
            yield cls.get_movement_aggregate(
                db,
                id,
                start_date,
                end_date,
                *args,
                **kwargs,
            )
