from typing import Iterable, Any
from pydantic import EmailStr
from datetime import date
from dateutil.relativedelta import relativedelta


from sqlalchemy.exc import NoResultFound
from sqlmodel import Relationship, SQLModel, Session, select, or_
from sqlmodel.sql.expression import SelectOfScalar

from app.common.models import Base
from app.utils import verify_password

from app.features.userinstitutionlink.models import UserInstitutionLink
from app.features.account.models import Account
from app.features.transaction import Transaction
from app.features.movement import Movement, PLStatement


class __UserBase(SQLModel):
    email: EmailStr
    full_name: str
    is_superuser: bool


class UserApiOut(__UserBase, Base):
    ...


class UserApiIn(__UserBase):
    password: str


class User(__UserBase, Base, table=True):
    hashed_password: str

    institution_links: list[UserInstitutionLink] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )
    noninstitutionalaccounts: list[Account.NonInstitutionalAccount] = Relationship(
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

    @classmethod
    def select_transactions(
        cls,
        statement: SelectOfScalar[Transaction],
        id: int,
    ) -> SelectOfScalar[Transaction]:
        return (
            statement.join(Account)
            .outerjoin(Account.InstitutionalAccount)
            .outerjoin(Account.NonInstitutionalAccount)
            .outerjoin(UserInstitutionLink)
            .where(
                or_(
                    UserInstitutionLink.user_id == id,
                    Account.NonInstitutionalAccount.user_id == id,
                )
            )
        )

    @classmethod
    def read_transactions(
        cls, db: Session, id: int, account_id: int, *args: Any, **kwargs: Any
    ) -> Iterable[Transaction]:
        statement = Transaction.select()
        statement = cls.select_transactions(statement, id)
        if account_id:
            statement = Account.select_transactions(statement, account_id)
        return Transaction.read_from_query(db, statement, *args, **kwargs)

    @classmethod
    def select_movements(
        cls,
        statement: SelectOfScalar[Movement],
        id: int,
    ) -> SelectOfScalar[Movement]:
        return (
            statement.join(Transaction)
            .join(Account)
            .outerjoin(Account.InstitutionalAccount)
            .outerjoin(Account.NonInstitutionalAccount)
            .outerjoin(UserInstitutionLink)
            .where(
                or_(
                    UserInstitutionLink.user_id == id,
                    Account.NonInstitutionalAccount.user_id == id,
                )
            )
        )

    @classmethod
    def read_movements(
        cls, db: Session, id: int, account_id: int, *args: Any, **kwargs: Any
    ) -> Iterable[Movement]:
        statement = Movement.select()
        statement = cls.select_movements(statement, id)
        if account_id:
            statement = Account.select_movements(statement, account_id)
        return Movement.read_from_query(db, statement, *args, **kwargs)

    @classmethod
    def get_movement_aggregate(
        cls, db: Session, id: int, *args: Any, **kwargs: Any
    ) -> PLStatement:
        statement = Movement.select()
        statement = cls.select_movements(statement, id)
        return Movement.get_aggregate(db, statement, *args, **kwargs)

    @classmethod
    def get_many_movement_aggregates(
        cls, db: Session, id: int, page: int, per_page: int, *args: Any, **kwargs: Any
    ) -> Iterable[PLStatement]:
        today = date.today()
        last_start_date = today.replace(day=1)
        offset = per_page * page
        for i in range(offset, offset + per_page):
            start_date = last_start_date - relativedelta(months=i)
            end_date = min(start_date + relativedelta(months=1), today)
            yield cls.get_movement_aggregate(
                db,
                id,
                start_date,
                end_date,
                *args,
                **kwargs,
            )
