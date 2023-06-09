from typing import TYPE_CHECKING
from pydantic import EmailStr
from sqlalchemy.exc import NoResultFound

from sqlmodel import Relationship, SQLModel, Session, select

from app.common.models import IdentifiableBase
from app.core.security import verify_password

if TYPE_CHECKING:
    from app.features.userinstitutionlink.models import UserInstitutionLink
    from app.features.account.models import Account

    NonInstitutionalAccount = Account.NonInstitutionalAccount


class __UserBase(SQLModel):
    email: EmailStr
    full_name: str
    is_superuser: bool


class UserApiOut(__UserBase, IdentifiableBase):
    ...


class UserApiIn(__UserBase):
    password: str


class User(__UserBase, IdentifiableBase, table=True):
    hashed_password: str

    institution_links: list["UserInstitutionLink"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )
    noninstitutionalaccounts: list["NonInstitutionalAccount"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )

    @classmethod
    def read_by_email(cls, db: Session, email: str) -> "User":
        db_user = db.exec(select(cls).where(cls.email == email)).first()
        if not db_user:
            raise NoResultFound
        return db_user

    @classmethod
    def authenticate(cls, db: Session, email: str, password: str) -> "User":
        db_user = cls.read_by_email(db, email=email)
        assert db_user.hashed_password
        verify_password(password, db_user.hashed_password)
        return db_user
