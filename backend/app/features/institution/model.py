from typing import TYPE_CHECKING

from sqlmodel import (
    # CheckConstraint,
    Relationship,
)

# import pycountry

from app.common.models import Base
from .schemas import InstitutionBase, InstitutionWrite

if TYPE_CHECKING:
    from app.features.userinstitutionlink.model import UserInstitutionLink

# country_codes = (country.alpha_2 for country in pycountry.countries)


class Institution(InstitutionBase, Base, table=True):
    user_links: list["UserInstitutionLink"] = Relationship(back_populates="institution")

    # __table_args__ = (CheckConstraint(country_code.in_(country_codes)),)
