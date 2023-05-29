from typing import TYPE_CHECKING
from decimal import Decimal

from sqlmodel import Field, Relationship, SQLModel

from app.common.models import Base
from app.features.institution.models import Institution
from app.features.user.models import User
from app.features.userinstitutionlink.models import UserInstitutionLink

if TYPE_CHECKING:
    from app.features.transaction.models import Transaction


class AccountBase(SQLModel):
    currency: str
    type: str
    number: str
    user_institution_link_id: int
    balance: Decimal
    plaid_id: str | None


class AccountRead(AccountBase, Base):
    ...


class AccountWrite(AccountBase):
    ...


class Account(Base, AccountBase, table=True):
    user_institution_link_id: int = Field(
        foreign_key="userinstitutionlink.id", nullable=False
    )

    userinstitutionlink: UserInstitutionLink = Relationship(back_populates="accounts")
    transactions: list["Transaction"] = Relationship(back_populates="account")

    @property
    def user(self) -> User:
        return self.userinstitutionlink.user

    @property
    def institution(self) -> Institution:
        return self.userinstitutionlink.institution
