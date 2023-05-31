from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel
from pydantic import BaseModel
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
    """Assumes current user, for API client usage"""

    ...


class UserInstitutionLinkWrite(InstitutionLinkWrite):
    """In model proper, for internal usage"""

    user_id: int


class UserInstitutionLinkSync(InstitutionLinkWrite):
    access_token: str


class UserInstitutionLink(Base, InstitutionUserLinkBase, table=True):
    user_id: int = Field(foreign_key="user.id")
    institution_id: int = Field(foreign_key="institution.id")
    access_token: str | None

    user: User = Relationship(back_populates="institution_links")
    institution: Institution = Relationship(back_populates="user_links")
    accounts: list["Account"] = Relationship(back_populates="userinstitutionlink")

    @property
    def is_synced(self) -> bool:
        return self.access_token != None
