from typing import TYPE_CHECKING

from fastapi.encoders import jsonable_encoder
from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship, Mapped, Session
from sqlalchemy.exc import NoResultFound

from app.core.security import get_password_hash, verify_password

from app import schemas

from app.models.base import Base

from .link import links

if TYPE_CHECKING:
    from .institution import Institution  # noqa: F401


class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_superuser = Column(Boolean(), default=False)
    institutions: Mapped[list["Institution"]] = relationship(
        "Institution", secondary=links
    )

    @classmethod
    def from_schema(cls, schema_obj: schemas.UserWrite, password: str) -> "User":
        return cls(**schema_obj.dict(), hashed_password=get_password_hash(password))

    @classmethod
    def read_by_email(cls, db: Session, email: str) -> "User":
        db_user = db.query(cls).filter(cls.email == email).first()
        if not db_user:
            raise NoResultFound
        return db_user

    @classmethod
    def create_or_update(cls, db: Session, obj_in: "User") -> "User":
        db.add(obj_in)
        db.commit()
        db.refresh(obj_in)
        return obj_in

    @classmethod
    def read(cls, db: Session, id: int) -> "User":
        db_obj = db.get(cls, id)
        if not db_obj:
            raise NoResultFound
        return db_obj

    @classmethod
    def read_many(cls, db: Session, skip: int = 0, limit: int = 100) -> list["User"]:
        return db.query(cls).offset(skip).limit(limit).all()

    @classmethod
    def update(cls, db: Session, id: int, obj_in: "User") -> "User":
        db_user_in = cls.read(db, id)
        for key, value in jsonable_encoder(obj_in).items():
            setattr(db_user_in, key, value)
        db_user_out = cls.create_or_update(db, db_user_in)
        return db_user_out

    @classmethod
    def authenticate(cls, db: Session, email: str, password: str) -> "User":
        db_user = cls.read_by_email(db, email=email)
        assert db_user.hashed_password
        verify_password(password, db_user.hashed_password)
        return db_user
