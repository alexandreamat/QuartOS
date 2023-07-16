from enum import Enum
from decimal import Decimal
from datetime import date
from typing import Iterable, TYPE_CHECKING, Any

from sqlmodel import SQLModel, Relationship, Session, and_, col, func, select
from sqlmodel.sql.expression import SelectOfScalar

from app.common.models import Base, CurrencyCode
from app.features.exchangerate.client import get_exchange_rate
from app.features.transaction import Transaction, TransactionApiOut

if TYPE_CHECKING:
    from app.features.user import User
    from app.features.account import Account


class PLStatement(SQLModel):
    start_date: date
    end_date: date
    income: Decimal
    expenses: Decimal
    currency_code: CurrencyCode


class __MovementBase(SQLModel):
    ...


class MovementField(str, Enum):
    TIMESTAMP = "timestamp"
    AMOUNT = "amount"


class MovementApiOut(__MovementBase, Base):
    earliest_timestamp: date | None
    latest_timestamp: date | None
    transactions: list[TransactionApiOut]
    amounts: dict[CurrencyCode, Decimal]


class MovementApiIn(__MovementBase):
    ...


class Movement(__MovementBase, Base, table=True):
    transactions: list[Transaction] = Relationship(
        back_populates="movement",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )

    @property
    def users(self) -> Iterable["User"]:
        for transaction in self.transactions:
            yield transaction.user

    @property
    def earliest_timestamp(self) -> date:
        return min(t.timestamp for t in self.transactions if t.timestamp)

    @property
    def latest_timestamp(self) -> date:
        return max(t.timestamp for t in self.transactions if t.timestamp)

    def amount(self, currency_code: CurrencyCode) -> Decimal:
        return sum(
            [
                t.amount
                * get_exchange_rate(t.currency_code, currency_code, t.timestamp)
                for t in self.transactions
            ],
            Decimal(0),
        )

    @property
    def amounts(self) -> dict[CurrencyCode, Decimal]:
        return {c: self.amount(c) for c in {t.currency_code for t in self.transactions}}

    @classmethod
    def create(cls, db: Session) -> "Movement":  # type: ignore[override]
        return super().create(db, cls())

    @classmethod
    def select_by_account(
        cls,
        statement: SelectOfScalar["Movement"],
        acount_id: int,
    ) -> SelectOfScalar["Movement"]:
        return statement.join(Transaction).join(Account).where(Account.id == acount_id)

    @classmethod
    def read_many_by_account(
        cls, db: Session, id: int, *args: Any, **kwargs: Any
    ) -> Iterable["Movement"]:
        statement = cls.select_by_account(Movement.select(), id)
        return Movement.read_from_query(db, statement, *args, **kwargs)

    @classmethod
    def read_from_query(
        cls,
        db: Session,
        statement: SelectOfScalar["Movement"],
        page: int,
        per_page: int,
        start_date: date | None,
        end_date: date | None,
        search: str | None,
        amount_gt: Decimal | None,
        amount_lt: Decimal | None,
        is_descending: bool,
        sort_by: MovementField,
    ) -> Iterable["Movement"]:
        # WHERE
        if start_date:
            statement = statement.where(Transaction.timestamp >= start_date)
        if end_date:
            statement = statement.where(Transaction.timestamp < end_date)
        if search:
            search = f"%{search}%"
            statement = statement.where(col(Transaction.name).like(search))

        # GROUP BY
        statement = statement.group_by(Movement.id)

        # ORDER BY
        if sort_by is MovementField.TIMESTAMP:
            if is_descending:
                order_clauses = Transaction.get_timestamp_desc_clauses()
            else:
                order_clauses = Transaction.get_timestamp_asc_clauses()
            statement = statement.order_by(*order_clauses)

        # LIMIT OFFSET
        if per_page:
            offset = page * per_page
            statement = statement.offset(offset).limit(per_page)

        movements = db.exec(statement).all()

        # Filter by amount is done on the queried objects
        if amount_gt is not None:
            movements = [
                m for m in movements if m.amount(CurrencyCode("USD")) > amount_gt
            ]

        if amount_lt is not None:
            movements = [
                m for m in movements if m.amount(CurrencyCode("USD")) < amount_lt
            ]

        if sort_by is MovementField.AMOUNT:
            movements = sorted(
                movements,
                key=lambda m: m.amount(CurrencyCode("USD")),
                reverse=is_descending,
            )

        return movements

    @classmethod
    def get_aggregate(
        cls,
        db: Session,
        statement: SelectOfScalar["Movement"],
        start_date: date,
        end_date: date,
        currency_code: CurrencyCode,
    ) -> PLStatement:
        statement = statement.group_by(cls.id).having(
            and_(
                func.min(Transaction.timestamp) >= start_date,
                func.min(Transaction.timestamp) < end_date,
            )
        )

        movements = db.exec(statement).all()

        income_total = Decimal(0)
        expense_total = Decimal(0)

        for movement in movements:
            amount = movement.amount(currency_code)
            if amount >= Decimal(0):
                income_total += amount
            else:
                expense_total += amount

        return PLStatement(
            start_date=start_date,
            end_date=end_date,
            income=income_total,
            expenses=expense_total,
            currency_code=currency_code,
        )
