from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Column, String
from sqlalchemy.orm import relationship, Mapped, Session
from sqlalchemy.exc import NoResultFound

from app.core.security import verify_password
from app.common.models import Base

if TYPE_CHECKING:
    from app.features.userinstitutionlink.model import UserInstitutionLink


class User(Base):
    __tablename__ = "users"

    full_name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_superuser = Column(Boolean(), nullable=False)

    institution_links: Mapped[list["UserInstitutionLink"]] = relationship(
        "UserInstitutionLink", back_populates="user"
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
