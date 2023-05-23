from typing import TYPE_CHECKING

from sqlalchemy import Column, String, CheckConstraint
from sqlalchemy.orm import Mapped, relationship
import pycountry

from app.common.models import Base

if TYPE_CHECKING:
    from app.features.userinstitutionlinks.model import UserInstitutionLink

country_codes = (country.alpha_2 for country in pycountry.countries)


class Institution(Base):
    __tablename__ = "institutions"

    name = Column(String, nullable=False)
    country_code = Column(String, nullable=False)

    user_links: Mapped[list["UserInstitutionLink"]] = relationship(
        "UserInstitutionLink", back_populates="institution"
    )

    __table_args__ = (CheckConstraint(country_code.in_(country_codes)),)
