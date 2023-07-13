from typing import TYPE_CHECKING
from decimal import Decimal
from datetime import date

from sqlmodel import Field, Relationship, SQLModel, asc, desc, col, Session
from sqlmodel.sql.expression import SelectOfScalar
from sqlalchemy.sql.expression import ClauseElement

from app.common.models import Base, CurrencyCode, SyncedMixin, SyncableBase, SyncedBase
from app.features.institution.models import Institution
from app.features.user.models import User
from app.features.userinstitutionlink.models import UserInstitutionLink
from app.features.account.models import Account

if TYPE_CHECKING:
    from app.features.movement.models import Movement


class __TransactionBase(SQLModel):
    amount: Decimal
    timestamp: date
    name: str
    currency_code: CurrencyCode
    account_id: int
    account_balance: Decimal | None
    movement_id: int | None


class TransactionApiOut(__TransactionBase, Base):
    account_balance: Decimal
    movement_id: int


class TransactionApiIn(__TransactionBase):
    ...


class TransactionPlaidIn(TransactionApiIn, SyncedMixin):
    ...


class TransactionPlaidOut(TransactionApiOut, SyncedBase):
    movement_id: int


class Transaction(__TransactionBase, SyncableBase, table=True):
    account_id: int = Field(foreign_key="account.id")
    movement_id: int = Field(foreign_key="movement.id")
    account_balance: Decimal

    account: Account = Relationship(back_populates="transactions")
    movement: "Movement" = Relationship(back_populates="transactions")

    @property
    def user(self) -> User:
        return self.account.user

    @property
    def institution(self) -> Institution | None:
        return self.account.institution

    @property
    def userinstitutionlink(self) -> UserInstitutionLink | None:
        return self.account.userinstitutionlink

    @property
    def is_synced(self) -> bool:
        return self.account.is_synced

    @classmethod
    def get_timestamp_desc_clauses(cls) -> tuple[ClauseElement, ClauseElement]:
        return desc(cls.timestamp), desc(cls.id)

    @classmethod
    def get_timestamp_asc_clauses(cls) -> tuple[ClauseElement, ClauseElement]:
        return asc(cls.timestamp), asc(cls.id)

    @classmethod
    def read_from_query(
        cls,
        db: Session,
        page: int,
        per_page: int,
        search: str | None,
        timestamp: date | None,
        is_descending: bool,
        statement: SelectOfScalar["Transaction"],
    ) -> list["Transaction"]:
        statement = statement.order_by(
            *(
                cls.get_timestamp_desc_clauses()
                if is_descending
                else cls.get_timestamp_asc_clauses()
            )
        )

        if timestamp:
            where_op = "__le__" if is_descending else "__ge__"  # choose >= or <=
            where_clause = getattr(col(Transaction.timestamp), where_op)(timestamp)
            statement = statement.where(where_clause)

        if search:
            search = f"%{search}%"
            statement = statement.where(col(Transaction.name).like(search))

        if per_page:
            offset = (page - 1) * per_page
            statement = statement.offset(offset).limit(per_page)
        transactions: list["Transaction"] = db.exec(statement).all()
        return transactions
