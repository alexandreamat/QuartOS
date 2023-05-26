from typing import TYPE_CHECKING

from sqlmodel import Relationship, Field

from app.common.models import Base
from app.features.userinstitutionlink.model import UserInstitutionLink
from app.features.user.model import User
from app.features.institution.model import Institution

from .schemas import AccountBase

if TYPE_CHECKING:
    from app.features.transaction.model import Transaction


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
