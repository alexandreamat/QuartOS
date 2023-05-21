from typing import TYPE_CHECKING

from sqlalchemy import Column, Integer, String, CheckConstraint
from sqlalchemy.orm import relationship, Session
from sqlalchemy.exc import NoResultFound
from fastapi.encoders import jsonable_encoder

import pycountry

from app.models.base import Base


country_codes = (country.alpha_2 for country in pycountry.countries)


class Institution(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    country_code = Column(String, nullable=False)

    __table_args__ = (CheckConstraint(country_code.in_(country_codes)),)
