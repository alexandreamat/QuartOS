from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel
from app.common.models import IdentifiableBase, PlaidBase, PlaidMaybeMixin
from app.features.institution.models import Institution
from app.features.user.models import User

if TYPE_CHECKING:
    # from app.features.account.models.Account import InstitutionalAccount
    from app.features.account.models import Account

    InstitutionalAccount = Account.InstitutionalAccount


class __UserInstitutionLinkBase(SQLModel):
    institution_id: int
    user_id: int | None


class __UserInstitutionLinkPlaidMixin(PlaidBase):
    access_token: str
    cursor: str | None


class UserInstitutionLinkApiIn(__UserInstitutionLinkBase):
    ...


class UserInstitutionLinkApiOut(__UserInstitutionLinkBase, IdentifiableBase):
    user_id: int
    is_synced: bool


class UserInstitutionLinkPlaidIn(
    __UserInstitutionLinkBase, __UserInstitutionLinkPlaidMixin
):
    user_id: int


class UserInstitutionLinkPlaidOut(
    __UserInstitutionLinkBase, __UserInstitutionLinkPlaidMixin, IdentifiableBase
):
    user_id: int


class UserInstitutionLink(
    __UserInstitutionLinkBase, IdentifiableBase, PlaidMaybeMixin, table=True
):
    user_id: int = Field(foreign_key="user.id")
    institution_id: int = Field(foreign_key="institution.id")
    access_token: str | None
    cursor: str | None

    user: User = Relationship(back_populates="institution_links")
    institution: Institution = Relationship(back_populates="user_links")
    institutionalaccounts: list["InstitutionalAccount"] = Relationship(
        back_populates="userinstitutionlink",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )

    @property
    def is_synced(self) -> bool:
        return self.access_token != None
