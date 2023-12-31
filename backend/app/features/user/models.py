from typing import Any
from pydantic import EmailStr


from sqlmodel import Relationship, SQLModel, Session, select, or_
from sqlmodel.sql.expression import SelectOfScalar

from app.common.models import ApiInMixin, ApiOutMixin, Base, CurrencyCode
from app.utils import verify_password

from app.features.userinstitutionlink import UserInstitutionLink
from app.features.account import Account
from app.features.transaction import Transaction
from app.features.movement import Movement
from app.features.accountacces.models import AccountAccess

logger = logging.getLogger(__name__)


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
    account_accesses: list[AccountAccess] = Relationship(
        back_populates="_user",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )

    @classmethod
    def read_by_email(cls, db: Session, email: str) -> "User":
        return cls.read_one_from_query(db, cls.select().where(cls.email == email))

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
        statement = Movement.select_movements(movement_id, **kwargs)

        statement = statement.join(Transaction)
        statement = statement.join(Account)
        statement = statement.join(AccountAccess)
        statement = statement.outerjoin(UserInstitutionLink)
        statement = statement.outerjoin(
            cls,
            or_(cls.id == UserInstitutionLink.user_id, cls.id == AccountAccess.user_id),
        )

        if accountaccess_id:
            statement = statement.where(AccountAccess.id == accountaccess_id)
        if account_id:
            statement = statement.where(Account.id == account_id)
        if userinstitutionlink_id:
            statement = statement.where(
                UserInstitutionLink.id == userinstitutionlink_id
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
        # SELECT FROM
        statement = Transaction.select_transactions(transaction_id, **kwargs)

        # JOIN
        statement = statement.join(Movement)
        statement = statement.join(Account)
        statement = statement.join(AccountAccess)
        statement = statement.outerjoin(UserInstitutionLink)
        statement = statement.outerjoin(
            cls,
            or_(
                cls.id == UserInstitutionLink.user_id,
                cls.id == AccountAccess.user_id,
            ),
        )

        # WHERE
        if movement_id:
            statement = statement.where(Movement.id == movement_id)
        if accountaccess_id:
            statement = statement.where(AccountAccess.id == accountaccess_id)
        if account_id:
            statement = statement.where(Account.id == account_id)
        if userinstitutionlink_id:
            statement = statement.where(
                UserInstitutionLink.id == userinstitutionlink_id
            )
        if user_id:
            statement = statement.where(cls.id == user_id)

        return statement
