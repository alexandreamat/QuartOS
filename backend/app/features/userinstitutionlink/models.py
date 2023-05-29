from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from app.common.models import Base
from app.features.institution.models import Institution
from app.features.user.models import User

if TYPE_CHECKING:
    from app.features.account.models import Account


class InstitutionUserLinkBase(SQLModel):
    client_id: str
    institution_id: int


class UserInstitutionLinkRead(InstitutionUserLinkBase, Base):
    user_id: int


class InstitutionLinkWrite(InstitutionUserLinkBase):
    """Assumes current user"""

    ...


class UserInstitutionLinkWrite(InstitutionLinkWrite):
    user_id: int
    access_token: str | None


class UserInstitutionLink(Base, table=True):
    user_id: int = Field(foreign_key="user.id")
    institution_id: int = Field(foreign_key="institution.id")
    client_id: str
    access_token: str | None

    user: User = Relationship(back_populates="institution_links")
    institution: Institution = Relationship(back_populates="user_links")
    accounts: list["Account"] = Relationship(back_populates="userinstitutionlink")
