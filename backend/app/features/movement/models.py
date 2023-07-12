from enum import Enum
from decimal import Decimal
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from typing import Iterable

from sqlmodel import SQLModel, Relationship, Session, and_, or_, col, func, select

from app.common.models import Base, CurrencyCode
from app.features.exchangerate.client import get_exchange_rate
from app.features.user import User  # type: ignore[attr-defined]
from app.features.userinstitutionlink import UserInstitutionLink  # type: ignore[attr-defined]
from app.features.account import Account  # type: ignore[attr-defined]
from app.features.transaction import Transaction, TransactionApiOut  # type: ignore[attr-defined]


class PLStatement(SQLModel):
    start_date: date
    end_date: date
    income: Decimal
    expenses: Decimal
    currency_code: CurrencyCode


class __MovementBase(SQLModel):
    ...


class MovementFields(str, Enum):
    TIMESTAMP = "timestamp"
    AMOUNT = "amount"


class MovementApiOut(__MovementBase, Base):
    earliest_timestamp: datetime | None
    latest_timestamp: datetime | None
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
    def users(self) -> Iterable[User]:
        for transaction in self.transactions:
            yield transaction.user

    @property
    def earliest_timestamp(self) -> datetime:
        return min(t.timestamp for t in self.transactions if t.timestamp)

    @property
    def latest_timestamp(self) -> datetime:
        return max(t.timestamp for t in self.transactions if t.timestamp)

    def amount(self, currency_code: CurrencyCode) -> Decimal:
        return sum(
            [
                t.amount
                * get_exchange_rate(t.currency_code, currency_code, t.timestamp.date())
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
    def read_many_by_user(
        cls,
        db: Session,
        user_id: int,
        page: int,
        per_page: int,
        start_date: date | None,
        end_date: date | None,
        search: str | None,
        amount_gt: Decimal | None,
        amount_lt: Decimal | None,
        account_id: int,
        is_descending: bool,
        sort_by: MovementFields,
    ) -> Iterable["Movement"]:
        statement = (
            cls.select()
            .join(Transaction)
            .join(Account)
            .outerjoin(Account.InstitutionalAccount)
            .outerjoin(Account.NonInstitutionalAccount)
            .outerjoin(UserInstitutionLink)
        )

        # WHERE
        statement = statement.where(
            or_(
                UserInstitutionLink.user_id == user_id,
                Account.NonInstitutionalAccount.user_id == user_id,
            )
        )
        if start_date:
            statement = statement.where(Transaction.timestamp >= start_date)
        if end_date:
            statement = statement.where(Transaction.timestamp < end_date)
        if search:
            search = f"%{search}%"
            statement = statement.where(col(Transaction.name).like(search))
        if account_id:
            statement = statement.where(Account.id == account_id)

        # GROUP BY
        statement = statement.group_by(Movement.id)

        # ORDER BY
        if sort_by is MovementFields.TIMESTAMP:
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

        if sort_by is MovementFields.AMOUNT:
            movements = sorted(
                movements,
                key=lambda m: m.amount(CurrencyCode("USD")),
                reverse=is_descending,
            )

        return movements

    @classmethod
    def get_monthly_aggregate(
        cls,
        db: Session,
        user_id: int,
        start_date: date,
        end_date: date,
        currency_code: CurrencyCode,
    ) -> PLStatement:
        subquery = (
            select(
                [
                    cls,
                    func.min(Transaction.timestamp).label("earliest_timestamp"),
                ]
            )
            .join(Transaction)
            .join(Account)
            .outerjoin(Account.InstitutionalAccount)
            .outerjoin(Account.NonInstitutionalAccount)
            .outerjoin(UserInstitutionLink)
            .where(
                or_(
                    UserInstitutionLink.user_id == user_id,
                    Account.NonInstitutionalAccount.user_id == user_id,
                )
            )
            .group_by(cls.id)
        ).subquery()

        statement = (
            cls.select()
            .join(subquery, cls.id == subquery.c.id)
            .where(
                and_(
                    subquery.c.earliest_timestamp >= start_date,
                    subquery.c.earliest_timestamp < end_date,
                )
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

    @classmethod
    def get_many_monthly_aggregates(
        cls,
        db: Session,
        user_id: int,
        currency_code: CurrencyCode,
        page: int,
        per_page: int,
    ) -> Iterable[PLStatement]:
        today = date.today()
        last_start_date = today.replace(day=1)
        offset = per_page * page
        for i in range(offset, offset + per_page):
            start_date = last_start_date - relativedelta(months=i)
            end_date = min(start_date + relativedelta(months=1), today)
            yield cls.get_monthly_aggregate(
                db, user_id, start_date, end_date, currency_code
            )
