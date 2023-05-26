from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime

from app.common.models import Base
from app.features.institution.models import Institution
from app.features.user.models import User
from app.features.userinstitutionlink.models import UserInstitutionLink
from app.features.account.models import Account


class TransactionBase(SQLModel):
    amount: int
    timestamp: datetime
    description: str
    currency: str
    category: str


class TransactionRead(TransactionBase, Base):
    ...


class TransactionWrite(TransactionBase):
    ...


class Transaction(TransactionBase, Base, table=True):
    account_id: int = Field(foreign_key="account.id")

    account: Account = Relationship(back_populates="transactions")

    @property
    def user(self) -> User:
        return self.account.userinstitutionlink.user

    @property
    def institution(self) -> Institution:
        return self.account.userinstitutionlink.institution

    @property
    def user_institution_link(self) -> UserInstitutionLink:
        return self.account.userinstitutionlink
