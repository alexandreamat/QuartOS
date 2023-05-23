from typing import TYPE_CHECKING

from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship, Mapped

from app.common.models import Base
from app.features.institution.model import Institution
from app.features.user.model import User

# if TYPE_CHECKING:
# from app.features.account.model import Account


class UserInstitutionLink(Base):
    __tablename__ = "user_institution_links"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    client_id = Column(String, nullable=False)

    user: Mapped[User] = relationship(User, back_populates="institution_links")
    institution: Mapped[Institution] = relationship(
        Institution, back_populates="user_links"
    )
    # accounts: Mapped[list["Account"]] = relationship(
    #     "Account", back_populates="user_institution_link"
    # )
