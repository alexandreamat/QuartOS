from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship, Mapped, Session

from app.common.models import Base
from app.features.userinstitutionlink.model import UserInstitutionLink
from app.features.user.model import User
from app.features.institution.model import Institution
from app.features.account.model import Account


class Transaction(Base):
    __tablename__ = "transactions"

    amount = Column(Integer, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    description = Column(String, nullable=False)
    currency = Column(String, nullable=False)
    category = Column(String, nullable=False)

    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)

    account: Mapped[Account] = relationship(Account, back_populates="transactions")

    @property
    def user(self) -> User:
        return self.account.user_institution_link.user

    @property
    def institution(self) -> Institution:
        return self.account.user_institution_link.institution

    @property
    def user_institution_link(self) -> UserInstitutionLink:
        return self.account.user_institution_link

    @classmethod
    def read_user(cls, db: Session, id: int) -> User:
        return cls.read(db, id).user

    @classmethod
    def read_institution(cls, db: Session, id: int) -> Institution:
        return cls.read(db, id).institution

    @classmethod
    def read_user_institution_link(cls, db: Session, id: int) -> UserInstitutionLink:
        return cls.read(db, id).user_institution_link
