from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, Mapped

from . import Base
from . import UserInstitutionLink


class Account(Base):
    __tablename__ = "accounts"

    number = Column(String, nullable=False)
    currency = Column(String, nullable=False)
    type = Column(String, nullable=False)
    user_institution_link_id = Column(
        Integer, ForeignKey("user_institution_links.id"), nullable=False
    )

    user_institution_link: Mapped[UserInstitutionLink] = relationship(
        UserInstitutionLink, back_populates="accounts"
    )
