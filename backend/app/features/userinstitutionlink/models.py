from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel
from app.common.models import SyncedMixin, SyncableBase, SyncedBase
from app.features.account import Account

if TYPE_CHECKING:
    from app.features.institution import Institution
    from app.features.user import User


class __UserInstitutionLinkBase(SQLModel):
    institution_id: int
    user_id: int | None


class __SyncedUserInstitutionLinkBase(__UserInstitutionLinkBase):
    access_token: str
    cursor: str | None
    user_id: int


class UserInstitutionLinkApiIn(__UserInstitutionLinkBase):
    ...


class UserInstitutionLinkApiOut(__UserInstitutionLinkBase, SyncableBase):
    user_id: int
    is_synced: bool


class UserInstitutionLinkPlaidIn(__SyncedUserInstitutionLinkBase, SyncedMixin):
    ...


class UserInstitutionLinkPlaidOut(__SyncedUserInstitutionLinkBase, SyncedBase):
    ...


class UserInstitutionLink(__UserInstitutionLinkBase, SyncableBase, table=True):
    user_id: int = Field(foreign_key="user.id")
    institution_id: int = Field(foreign_key="institution.id")
    access_token: str | None
    cursor: str | None

    user: "User" = Relationship(back_populates="institution_links")
    institution: "Institution" = Relationship(back_populates="user_links")
    institutionalaccounts: list[Account.InstitutionalAccount] = Relationship(
        back_populates="userinstitutionlink",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )

    @property
    def is_synced(self) -> bool:
        return self.access_token != None
