from typing import TYPE_CHECKING

from sqlmodel import Relationship, Field

from app.common.models import Base
from app.features.institution.model import Institution
from app.features.user.model import User

if TYPE_CHECKING:
    from app.features.account.model import Account


class UserInstitutionLink(Base, table=True):
    user_id: int = Field(foreign_key="user.id")
    institution_id: int = Field(foreign_key="institution.id")
    client_id: str

    user: User = Relationship(back_populates="institution_links")
    institution: Institution = Relationship(back_populates="user_links")
    accounts: list["Account"] = Relationship(back_populates="userinstitutionlink")
