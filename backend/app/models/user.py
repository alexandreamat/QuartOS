from typing import TYPE_CHECKING

from fastapi.encoders import jsonable_encoder
from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship, Mapped, Session
from sqlalchemy.exc import NoResultFound

from app.core.security import get_password_hash, verify_password


from app.models.base import Base


if TYPE_CHECKING:
    from .institution import Institution  # noqa: F401


class User(Base):
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_superuser = Column(Boolean(), default=False)

    institutions: Mapped[list["Institution"]] = relationship(
        "Institution", secondary="user_institution_links"
    )

    @classmethod
    def read_by_email(cls, db: Session, email: str) -> "User":
        db_user = db.query(cls).filter(cls.email == email).first()
        if not db_user:
            raise NoResultFound
        return db_user

    @classmethod
    def authenticate(cls, db: Session, email: str, password: str) -> "User":
        db_user = cls.read_by_email(db, email=email)
        assert db_user.hashed_password
        verify_password(password, db_user.hashed_password)
        return db_user
