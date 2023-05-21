from typing import TYPE_CHECKING

from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship, Mapped

from app.models.base import Base

from . import User
from . import Institution

if TYPE_CHECKING:
    from . import Account


class UserInstitutionLink(Base):
    user_id = Column(Integer, ForeignKey("user.id"), primary_key=True)
    institution_id = Column(Integer, ForeignKey("institution.id"), primary_key=True)

    user: Mapped[User] = relationship(User, back_populates="institutions")
    institution: Mapped[Institution] = relationship(Institution, back_populates="users")
    accounts: Mapped[list["Account"]] = relationship(
        "Account", back_populates="user_institution_link"
    )
