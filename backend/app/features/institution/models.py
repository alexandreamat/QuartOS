from typing import TYPE_CHECKING, Annotated, Any
import base64

from pydantic import HttpUrl, validator, constr
from sqlmodel import Relationship, SQLModel, Field
import pycountry

from app.common.models import SyncedMixin, SyncableBase, SyncedBase
from app.features.transactiondeserialiser.models import TransactionDeserialiser

if TYPE_CHECKING:
    from app.features.userinstitutionlink.models import UserInstitutionLink


class __InstitutionBase(SQLModel):
    name: str
    country_code: str
    url: HttpUrl | None
    transactiondeserialiser_id: int | None
    colour: Annotated[str, constr(regex=r"^#[0-9a-fA-F]{6}$")] | None

    @validator("country_code")
    def country_code_must_exist(cls, value: str) -> str:
        if value not in [country.alpha_2 for country in pycountry.countries]:
            raise ValueError("Invalid country code")
        return value


class InstitutionApiOut(__InstitutionBase, SyncableBase):
    logo_base64: str | None
    is_synced: bool

    @classmethod
    def from_orm(
        cls, obj: Any, update: dict[str, Any] | None = None
    ) -> "InstitutionApiOut":
        m = super().from_orm(obj, update)
        if obj.logo:
            m.logo_base64 = base64.b64encode(obj.logo).decode()
        return m


class InstitutionApiIn(__InstitutionBase):
    url: HttpUrl


class InstitutionPlaidOut(__InstitutionBase, SyncedBase):
    logo: bytes | None


class InstitutionPlaidIn(__InstitutionBase, SyncedMixin):
    logo: bytes | None


class Institution(__InstitutionBase, SyncableBase, table=True):
    logo: bytes | None
    transactiondeserialiser_id: int | None = Field(
        foreign_key="transactiondeserialiser.id"
    )
    user_links: list["UserInstitutionLink"] = Relationship(
        back_populates="institution",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )
    transactiondeserialiser: TransactionDeserialiser | None = Relationship(
        back_populates="institutions"
    )

    @property
    def is_synced(self) -> bool:
        return self.plaid_id is not None
