from typing import TYPE_CHECKING

from pydantic import HttpUrl, validator
from sqlmodel import Relationship, SQLModel, Field
import pycountry

from app.common.models import IdentifiableBase, PlaidBase, PlaidMaybeMixin
from app.features.transactiondeserialiser.models import TransactionDeserialiser

if TYPE_CHECKING:
    from app.features.userinstitutionlink.models import UserInstitutionLink


class __InstitutionBase(SQLModel):
    name: str
    country_code: str
    url: HttpUrl | None
    transaction_deserialiser_id: int | None

    @validator("country_code")
    def country_code_must_exist(cls, value: str) -> str:
        if value not in [country.alpha_2 for country in pycountry.countries]:
            raise ValueError("Invalid country code")
        return value


class InstitutionApiOut(__InstitutionBase, IdentifiableBase):
    ...


class InstitutionApiIn(__InstitutionBase):
    url: HttpUrl


class InstitutionPlaidOut(__InstitutionBase, PlaidBase, IdentifiableBase):
    ...


class InstitutionPlaidIn(__InstitutionBase, PlaidBase):
    ...


class Institution(__InstitutionBase, IdentifiableBase, PlaidMaybeMixin, table=True):
    transaction_deserialiser_id: int | None = Field(
        foreign_key="transactiondeserialiser.id"
    )
    user_links: list["UserInstitutionLink"] = Relationship(
        back_populates="institution",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )
    transactiondeserialiser: TransactionDeserialiser = Relationship(
        back_populates="institutions"
    )
