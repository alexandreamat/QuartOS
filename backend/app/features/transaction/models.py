from typing import TYPE_CHECKING
from decimal import Decimal
from datetime import date

from sqlmodel import Field, Relationship, SQLModel, asc, desc, col
from sqlmodel.sql.expression import SelectOfScalar
from sqlalchemy.sql.expression import ClauseElement

from app.common.models import Base, CurrencyCode, SyncedMixin, SyncableBase, SyncedBase
from app.common.utils import filter_query_by_search

if TYPE_CHECKING:
    from app.features.institution import Institution
    from app.features.user import User
    from app.features.userinstitutionlink import UserInstitutionLink
    from app.features.account import Account
    from app.features.movement import Movement


class __TransactionBase(SQLModel):
    amount: Decimal
    timestamp: date
    name: str


class TransactionApiOut(__TransactionBase, Base):
    account_balance: Decimal
    account_id: int
    movement_id: int


class TransactionApiIn(__TransactionBase):
    ...


class TransactionPlaidIn(TransactionApiIn, SyncedMixin):
    ...


class TransactionPlaidOut(TransactionApiOut, SyncedBase):
    ...


class Transaction(__TransactionBase, SyncableBase, table=True):
    account_id: int = Field(foreign_key="account.id")
    movement_id: int = Field(foreign_key="movement.id")
    account_balance: Decimal

    account: "Account" = Relationship(back_populates="transactions")
    movement: "Movement" = Relationship(back_populates="transactions")

    @property
    def currency_code(self) -> CurrencyCode:
        return self.account.currency_code

    @property
    def user(self) -> "User":
        return self.account.user

    @property
    def institution(self) -> "Institution | None":
        return self.account.institution

    @property
    def userinstitutionlink(self) -> "UserInstitutionLink | None":
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
    def select_transactions(
        cls,
        transaction_id: int | None,
        page: int = 0,
        per_page: int = 0,
        search: str | None = None,
        timestamp: date | None = None,
        is_descending: bool = True,
        amount_ge: Decimal | None = None,
        amount_le: Decimal | None = None,
    ) -> SelectOfScalar["Transaction"]:
        # SELECT
        statement = Transaction.select()

        # WHERE
        if transaction_id:
            statement = statement.where(Transaction.id == transaction_id)
        if timestamp:
            where_op = "__le__" if is_descending else "__ge__"  # choose >= or <=
            where_clause = getattr(col(Transaction.timestamp), where_op)(timestamp)
            statement = statement.where(where_clause)
        if search:
            statement = filter_query_by_search(search, statement, col(Transaction.name))
        if amount_ge:
            statement = statement.where(Transaction.amount >= amount_ge)
        if amount_le:
            statement = statement.where(Transaction.amount <= amount_le)

        # ORDER BY
        statement = statement.order_by(
            *(
                cls.get_timestamp_desc_clauses()
                if is_descending
                else cls.get_timestamp_asc_clauses()
            )
        )

        # OFFSET and LIMIT
        if per_page:
            offset = page * per_page
            statement = statement.offset(offset).limit(per_page)

        return statement
