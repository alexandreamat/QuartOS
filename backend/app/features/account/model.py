from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, Mapped, Session

from app.common.models import Base
from app.features.userinstitutionlink.model import UserInstitutionLink
from app.features.user.model import User
from app.features.institution.model import Institution


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

    @property
    def user(self) -> User:
        return self.user_institution_link.user

    @property
    def institution(self) -> Institution:
        return self.user_institution_link.institution

    @classmethod
    def read_user(cls, db: Session, id: int) -> User:
        return cls.read(db, id).user

    @classmethod
    def read_institution(cls, db: Session, id: int) -> Institution:
        return cls.read(db, id).institution
