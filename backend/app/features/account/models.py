from typing import TYPE_CHECKING, Any
from decimal import Decimal
from enum import Enum

from sqlmodel import Field, Relationship, SQLModel
from pydantic import root_validator, validator
import pycountry

from app.common.models import IdentifiableBase, CurrencyCode, PlaidBase, PlaidMaybeMixin
from app.features.institution.models import Institution
from app.features.user.models import User
from app.features.userinstitutionlink.models import UserInstitutionLink
from app.features.transactiondeserialiser.models import TransactionDeserialiser

if TYPE_CHECKING:
    from app.features.transaction.models import Transaction


class _InstitutionalAccountBase(SQLModel):
    class InstitutionalAccountType(str, Enum):
        INVESTMENT = "investment"
        CREDIT = "credit"
        DEPOSITORY = "depository"
        LOAN = "loan"
        BROKERAGE = "brokerage"
        OTHER = "other"

    user_institution_link_id: int
    type: InstitutionalAccountType
    mask: str


class InstitutionalAccountPlaidIn(_InstitutionalAccountBase, PlaidBase):
    ...


class InstitutionalAccountPlaidOut(
    _InstitutionalAccountBase, IdentifiableBase, PlaidBase
):
    ...


class InstitutionalAccountApiIn(_InstitutionalAccountBase):
    ...


class InstitutionalAccountApiOut(_InstitutionalAccountBase, IdentifiableBase):
    ...


class InstitutionalAccount(
    _InstitutionalAccountBase, IdentifiableBase, PlaidMaybeMixin, table=True
):
    user_institution_link_id: int = Field(foreign_key="userinstitutionlink.id")

    userinstitutionlink: UserInstitutionLink = Relationship(
        back_populates="institutionalaccounts"
    )
    account: "Account" = Relationship(
        back_populates="institutionalaccount", sa_relationship_kwargs={"uselist": False}
    )

    @property
    def user(self) -> User:
        return self.userinstitutionlink.user

    @property
    def institution(self) -> Institution:
        return self.userinstitutionlink.institution

    @property
    def transactiondeserialiser(self) -> TransactionDeserialiser | None:
        return self.userinstitutionlink.institution.transactiondeserialiser

    @property
    def is_synced(self) -> bool:
        return self.userinstitutionlink.is_synced


class _NonInstitutionalAccountBase(SQLModel):
    class NonInstitutionalAccountType(str, Enum):
        PERSONAL_LEDGER = "personal ledger"
        CASH = "cash"
        PROPERTY = "property"

    type: NonInstitutionalAccountType
    user_id: int | None


class NonInstitutionalAccountApiIn(_NonInstitutionalAccountBase):
    ...


class NonInstitutionalAccountApiOut(_NonInstitutionalAccountBase, IdentifiableBase):
    user_id: int


class NonInstitutionalAccount(
    _NonInstitutionalAccountBase, IdentifiableBase, table=True
):
    user_id: int = Field(foreign_key="user.id")
    user: User = Relationship(back_populates="noninstitutionalaccounts")
    account: "Account" = Relationship(
        back_populates="noninstitutionalaccount",
        sa_relationship_kwargs={"uselist": False},
    )


class __AccountBase(SQLModel):
    currency_code: CurrencyCode
    balance: Decimal
    name: str

    @validator("currency_code")
    def currency_code_must_exist(cls, value: str) -> str:
        if value not in [currency.alpha_3 for currency in pycountry.currencies]:
            raise ValueError("Invalid currency code")
        return value

    @root_validator()
    def only_one_type_allowed(
        cls,
        values: dict[str, Any],
    ) -> dict[str, Any]:
        institutionalaccount = values.get("institutionalaccount")
        noninstitutionalaccount = values.get("noninstitutionalaccount")
        if bool(institutionalaccount) is bool(noninstitutionalaccount):
            raise ValueError("One and only one account must be defined")
        return values


class AccountApiIn(__AccountBase):
    institutionalaccount: InstitutionalAccountApiIn | None
    noninstitutionalaccount: NonInstitutionalAccountApiIn | None


class AccountApiOut(__AccountBase, IdentifiableBase):
    institutionalaccount: InstitutionalAccountApiOut | None
    noninstitutionalaccount: NonInstitutionalAccountApiOut | None
    is_synced: bool


class AccountPlaidIn(__AccountBase):
    institutionalaccount: InstitutionalAccountPlaidIn


class AccountPlaidOut(__AccountBase, IdentifiableBase):
    institutionalaccount: InstitutionalAccountPlaidOut


class Account(__AccountBase, IdentifiableBase, table=True):
    institutional_account_id: int | None = Field(foreign_key="institutionalaccount.id")
    non_institutional_account_id: int | None = Field(
        foreign_key="noninstitutionalaccount.id"
    )

    institutionalaccount: InstitutionalAccount | None = Relationship(
        back_populates="account",
        sa_relationship_kwargs={"uselist": False, "cascade": "all, delete"},
    )
    noninstitutionalaccount: NonInstitutionalAccount | None = Relationship(
        back_populates="account",
        sa_relationship_kwargs={"uselist": False, "cascade": "all, delete"},
    )

    transactions: list["Transaction"] = Relationship(
        back_populates="account",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )

    @property
    def user(self) -> User:
        if self.institutionalaccount:
            return self.institutionalaccount.userinstitutionlink.user
        if self.noninstitutionalaccount:
            return self.noninstitutionalaccount.user
        raise ValueError

    @property
    def transactiondeserialiser(self) -> TransactionDeserialiser | None:
        if self.institutionalaccount:
            return self.institutionalaccount.transactiondeserialiser
        return None

    @property
    def institution(self) -> Institution | None:
        if self.institutionalaccount:
            return self.institutionalaccount.institution
        return None

    @property
    def userinstitutionlink(self) -> UserInstitutionLink | None:
        if self.institutionalaccount:
            return self.institutionalaccount.userinstitutionlink
        return None

    @property
    def is_synced(self) -> bool:
        if self.institutionalaccount:
            return self.institutionalaccount.is_synced
        return False
