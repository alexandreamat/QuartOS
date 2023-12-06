from typing import TYPE_CHECKING, Any

from sqlmodel import Field, Relationship, SQLModel
from sqlmodel.sql.expression import SelectOfScalar

from app.common.models import (
    ApiInMixin,
    PlaidInMixin,
    SyncableBase,
    PlaidOutMixin,
    SyncableApiOutMixin,
)
from app.features.account import Account
from app.features.transaction import Transaction
from app.features.movement import Movement
from app.features.accountacces.models import AccountAccess

if TYPE_CHECKING:
    from app.features.institution import Institution
    from app.features.user import User


class __UserInstitutionLinkBase(SQLModel):
    ...


class __SyncedUserInstitutionLinkBase(__UserInstitutionLinkBase):
    access_token: str
    cursor: str | None


class UserInstitutionLinkApiIn(__UserInstitutionLinkBase, ApiInMixin):
    ...


class UserInstitutionLinkApiOut(__UserInstitutionLinkBase, SyncableApiOutMixin):
    institution_id: int
    user_id: int


class UserInstitutionLinkPlaidIn(__SyncedUserInstitutionLinkBase, PlaidInMixin):
    ...


class UserInstitutionLinkPlaidOut(__SyncedUserInstitutionLinkBase, PlaidOutMixin):
    institution_id: int
    user_id: int


class UserInstitutionLink(__UserInstitutionLinkBase, SyncableBase, table=True):
    user_id: int = Field(foreign_key="user.id")
    institution_id: int = Field(foreign_key="institution.id")
    access_token: str | None
    cursor: str | None

    user: "User" = Relationship(back_populates="institution_links")
    institution: "Institution" = Relationship(back_populates="user_links")
    accounts: list[Account] = Relationship(
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

    @classmethod
    def select_account_accesses(
        cls,
        userinstitutionlink_id: int | None,
        account_id: int | None,
        accountaccess_id: int | None,
    ) -> SelectOfScalar[AccountAccess]:
        statement = Account.select_account_accesses(account_id, accountaccess_id)

        statement = statement.outerjoin(cls)
        if userinstitutionlink_id:
            statement = statement.where(cls.id == userinstitutionlink_id)

        return statement

    @classmethod
    def select_movements(
        cls,
        userinstitutionlink_id: int | None,
        account_id: int | None,
        accountaccess_id: int | None,
        movement_id: int | None,
        **kwargs: Any,
    ) -> SelectOfScalar[Movement]:
        statement = Account.select_movements(
            account_id, accountaccess_id, movement_id, **kwargs
        )

        statement = statement.outerjoin(cls)
        if userinstitutionlink_id:
            statement = statement.where(cls.id == userinstitutionlink_id)

        return statement

    @classmethod
    def select_transactions(
        cls,
        userinstitutionlink_id: int | None,
        account_id: int | None,
        accountaccess_id: int | None,
        movement_id: int | None,
        transaction_id: int | None,
        **kwargs: Any,
    ) -> SelectOfScalar[Transaction]:
        statement = Account.select_transactions(
            account_id, accountaccess_id, movement_id, transaction_id, **kwargs
        )

        statement = statement.outerjoin(cls)
        if userinstitutionlink_id:
            statement = statement.where(cls.id == userinstitutionlink_id)

        return statement
