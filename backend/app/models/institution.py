from sqlalchemy import Column, Integer, String, CheckConstraint
from sqlalchemy.orm import relationship, Mapped
import pycountry

from app.db.base_class import Base
from typing import TYPE_CHECKING

from .link import links

if TYPE_CHECKING:
    from .user import User  # noqa: F401


country_codes = (country.alpha_2 for country in pycountry.countries)


class Institution(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    country_code = Column(String, nullable=False)

    __table_args__ = (CheckConstraint(country_code.in_(country_codes)),)
