from typing import TYPE_CHECKING
from decimal import Decimal
from enum import Enum

from sqlmodel import Field, Relationship, SQLModel
from pydantic import validator
import pycountry

from app.common.models import IdentifiableBase, CurrencyCode
from app.features.institution.models import Institution
from app.features.user.models import User
from app.features.userinstitutionlink.models import UserInstitutionLink

if TYPE_CHECKING:
    from app.features.transaction.models import Transaction


class AccountType(str, Enum):
    INVESTMENT = "investment"
    CREDIT = "credit"
    DEPOSITORY = "depository"
    LOAN = "loan"
    BROKERAGE = "brokerage"
    OTHER = "other"


class __AccountBase(SQLModel):
    currency_code: CurrencyCode
    type: AccountType
    user_institution_link_id: int
    balance: Decimal
    name: str
    mask: str

    @validator("currency_code")
    def currency_code_must_exist(cls, value: str) -> str:
        if value not in [currency.alpha_3 for currency in pycountry.currencies]:
            raise ValueError("Invalid currency code")
        return value


class __AccountPlaidMixin(SQLModel):
    plaid_id: str


class AccountApiOut(__AccountBase, IdentifiableBase):
    ...


class AccountApiIn(__AccountBase):
    ...


class AccountPlaidIn(__AccountBase, __AccountPlaidMixin):
    ...


class AccountPlaidOut(__AccountBase, __AccountPlaidMixin, IdentifiableBase):
    ...


class Account(__AccountBase, IdentifiableBase, table=True):
    user_institution_link_id: int = Field(
        foreign_key="userinstitutionlink.id", nullable=False
    )

    userinstitutionlink: UserInstitutionLink = Relationship(back_populates="accounts")
    transactions: list["Transaction"] = Relationship(back_populates="account")
    plaid_id: str | None = Field(unique=True)

    @property
    def user(self) -> User:
        return self.userinstitutionlink.user

    @property
    def institution(self) -> Institution:
        return self.userinstitutionlink.institution

    @property
    def is_synced(self) -> bool:
        return self.userinstitutionlink.is_synced
