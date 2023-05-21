from typing import TYPE_CHECKING

from sqlalchemy import Column, Integer, String, CheckConstraint
from sqlalchemy.orm import relationship, Session
from sqlalchemy.exc import NoResultFound
from fastapi.encoders import jsonable_encoder

import pycountry

from app.models.base import Base

from .link import links

from app import schemas


country_codes = (country.alpha_2 for country in pycountry.countries)


class Institution(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    country_code = Column(String, nullable=False)

    __table_args__ = (CheckConstraint(country_code.in_(country_codes)),)

    @classmethod
    def from_schema(cls, schema_obj: schemas.InstitutionWrite) -> "Institution":
        return cls(**schema_obj.dict())

    @classmethod
    def create_or_update(cls, db: Session, obj: "Institution") -> "Institution":
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @classmethod
    def create(
        cls,
        db: Session,
        obj: "Institution",
    ) -> "Institution":
        return cls.create_or_update(db, obj)

    @classmethod
    def read(cls, db: Session, id: int) -> "Institution":
        obj = db.get(cls, id)
        if not obj:
            raise NoResultFound
        return obj

    @classmethod
    def read_many(
        cls, db: Session, skip: int = 0, limit: int = 100
    ) -> list["Institution"]:
        return db.query(cls).offset(skip).limit(limit).all()

    @classmethod
    def update(cls, db: Session, id: int, obj: "Institution") -> "Institution":
        obj = cls.read(db, id)
        for key, value in jsonable_encoder(obj).items():
            setattr(obj, key, value)
        db_user_out = cls.create_or_update(db, obj)
        return db_user_out

    @classmethod
    def delete(cls, db: Session, id: int) -> None:
        obj = cls.read(db, id)
        db.delete(obj)
