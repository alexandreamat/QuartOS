from typing import TYPE_CHECKING

from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship, Mapped

from app.models.base import Base

from . import User
from . import Institution

if TYPE_CHECKING:
    from . import Account


class UserInstitutionLink(Base):
    __tablename__ = "user_institution_links"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)

    user: Mapped[User] = relationship(User, back_populates="institution_links")
    institution: Mapped[Institution] = relationship(
        Institution, back_populates="user_links"
    )
    accounts: Mapped[list["Account"]] = relationship(
        "Account", back_populates="user_institution_link"
    )
