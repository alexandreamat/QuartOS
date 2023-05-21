from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, Mapped

from . import Base
from . import UserInstitutionLink


class Account(Base):
    name = Column(String)
    currency = Column(String)
    type = Column(String)
    user_institution_link_id = Column(Integer, ForeignKey("user_institution_link.id"))

    user_institution_link: Mapped[UserInstitutionLink] = relationship(
        UserInstitutionLink, back_populates="accounts"
    )
