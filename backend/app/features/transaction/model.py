from sqlmodel import Field, DateTime, Relationship

from app.common.models import Base
from app.features.userinstitutionlink.model import UserInstitutionLink
from app.features.user.model import User
from app.features.institution.model import Institution
from app.features.account.model import Account

from .schemas import TransactionBase


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
