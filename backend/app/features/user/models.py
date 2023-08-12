from typing import Any
from pydantic import EmailStr


from sqlalchemy.exc import NoResultFound
from sqlmodel import Relationship, SQLModel, Session, select, or_
from sqlmodel.sql.expression import SelectOfScalar

from app.common.models import Base
from app.utils import verify_password

from app.features.userinstitutionlink import UserInstitutionLink
from app.features.account import Account
from app.features.transaction import Transaction
from app.features.movement import Movement


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
