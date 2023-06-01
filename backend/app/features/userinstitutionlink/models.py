from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel
from app.common.models import IdentifiableBase, PlaidBase, PlaidMaybeMixin
from app.features.institution.models import Institution
from app.features.user.models import User

if TYPE_CHECKING:
    from app.features.account.models import Account


class __InstitutionLinkBase(SQLModel):
    institution_id: int


class __UserLinkBase(SQLModel):
    user_id: int


class __UserInstitutionLinkBase(__InstitutionLinkBase, __UserLinkBase):
    ...


class __UserInstitutionLinkPlaidMixin(PlaidBase):
    access_token: str
    cursor: str | None


class InstitutionLinkApiIn(__InstitutionLinkBase):
    """Assumes current user, for API client usage"""

    ...


class UserInstitutionLinkApiOut(__UserInstitutionLinkBase, IdentifiableBase):
    is_synced: bool


class UserInstitutionLinkApiIn(__UserInstitutionLinkBase):
    """In model proper, for internal usage"""

    ...


class UserInstitutionLinkPlaidIn(
    __UserInstitutionLinkBase, __UserInstitutionLinkPlaidMixin
):
    ...


class UserInstitutionLinkPlaidOut(
    __UserInstitutionLinkBase, __UserInstitutionLinkPlaidMixin, IdentifiableBase
):
    ...


class UserInstitutionLink(
    __InstitutionLinkBase, IdentifiableBase, PlaidMaybeMixin, table=True
):
    user_id: int = Field(foreign_key="user.id")
    institution_id: int = Field(foreign_key="institution.id")
    access_token: str | None
    cursor: str | None

    user: User = Relationship(back_populates="institution_links")
    institution: Institution = Relationship(back_populates="user_links")
    accounts: list["Account"] = Relationship(
        back_populates="userinstitutionlink",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )

    @property
    def is_synced(self) -> bool:
        return self.access_token != None
