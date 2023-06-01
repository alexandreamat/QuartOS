from typing import TYPE_CHECKING

from pydantic import HttpUrl, validator
from sqlmodel import Relationship, SQLModel, Session, select, Field
from sqlalchemy.exc import NoResultFound
import pycountry

from app.common.models import IdentifiableBase

if TYPE_CHECKING:
    from app.features.userinstitutionlink.models import UserInstitutionLink


class __InstitutionBase(SQLModel):
    name: str
    country_code: str
    url: HttpUrl | None

    @validator("country_code")
    def country_code_must_exist(cls, value: str) -> str:
        if value not in [country.alpha_2 for country in pycountry.countries]:
            raise ValueError("Invalid country code")
        return value


class __InstitutionPlaidMixin(SQLModel):
    plaid_id: str


class InstitutionApiOut(__InstitutionBase, IdentifiableBase):
    ...


class InstitutionApiIn(__InstitutionBase):
    url: HttpUrl


class InstitutionPlaidOut(__InstitutionBase, __InstitutionPlaidMixin, IdentifiableBase):
    ...


class InstitutionPlaidIn(__InstitutionBase, __InstitutionPlaidMixin):
    ...


class Institution(__InstitutionBase, IdentifiableBase, table=True):
    user_links: list["UserInstitutionLink"] = Relationship(back_populates="institution")
    plaid_id: str | None = Field(unique=True)

    @classmethod
    def read_by_plaid_id(cls, db: Session, plaid_id: str) -> "Institution":
        obj = db.exec(select(cls).where(cls.plaid_id == plaid_id)).first()
        if not obj:
            raise NoResultFound
        return obj
