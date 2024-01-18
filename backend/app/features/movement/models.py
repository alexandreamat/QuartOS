# Copyright (C) 2024 Alexandre Amat
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

from datetime import date
from decimal import Decimal
from enum import Enum
from typing import Iterable, Any, Type, Union, Dict

import requests
from sqlmodel import SQLModel, Relationship, col, func, select, desc, asc
from sqlmodel.main import _TSQLModel
from sqlmodel.sql.expression import SelectOfScalar

from app.common.models import Base, CurrencyCode
from app.common.utils import filter_query_by_search
from app.features.exchangerate.client import get_exchange_rate
from app.features.transaction import Transaction, TransactionApiOut


class PLStatement(SQLModel):
    start_date: date
    end_date: date
    income: Decimal
    expenses: Decimal


class __MovementBase(SQLModel):
    name: str


class MovementField(str, Enum):
    TIMESTAMP = "timestamp"
    AMOUNT = "amount"


class MovementApiOut(__MovementBase, Base):
    earliest_timestamp: date | None
    latest_timestamp: date | None
    transactions: list[TransactionApiOut]
    amount_default_currency: Decimal


class MovementApiIn(__MovementBase):
    ...


class Movement(__MovementBase, Base, table=True):
    transactions: list[Transaction] = Relationship(
        back_populates="movement",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )

    @property
    def earliest_timestamp(self) -> date:
        return min(t.timestamp for t in self.transactions)

    @property
    def latest_timestamp(self) -> date:
        return max(t.timestamp for t in self.transactions)

    @property
    def amount_default_currency(self) -> Decimal:
        return sum(
            [t.amount_default_currency for t in self.transactions],
            Decimal(0),
        )

    @property
    def currencies(self) -> set[CurrencyCode]:
        return {t.currency_code for t in self.transactions}

    @classmethod
    def select_transactions(
        cls, movement_id: int | None, transaction_id: int | None, **kwargs: Any
    ) -> SelectOfScalar[Transaction]:
        statement = Transaction.select_transactions(transaction_id, **kwargs)

        statement = statement.join(cls)
        if movement_id:
            statement = statement.where(cls.id == movement_id)

        return statement

    @classmethod
    def select_movements(
        cls,
        movement_id: int | None,
        page: int = 0,
        per_page: int | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
        search: str | None = None,
        is_descending: bool = True,
        transaction_amount_ge: Decimal | None = None,
        transaction_amount_le: Decimal | None = None,
        is_amount_abs: bool = False,
        transactionsGe: int | None = None,
        transactionsLe: int | None = None,
        sort_by: MovementField = MovementField.TIMESTAMP,
    ) -> SelectOfScalar["Movement"]:
        # SELECT
        statement = cls.select()

        # WHERE
        if movement_id:
            statement = statement.where(cls.id == movement_id)
        if search:
            statement = filter_query_by_search(search, statement, col(cls.name))
        if transaction_amount_ge:
            if is_amount_abs:
                statement = statement.where(
                    func.abs(Transaction.amount) >= transaction_amount_ge
                )
            else:
                statement = statement.where(
                    col(Transaction.amount) >= transaction_amount_ge
                )
        if transaction_amount_le:
            if is_amount_abs:
                statement = statement.where(
                    func.abs(Transaction.amount) <= transaction_amount_le
                )
            else:
                statement = statement.where(Transaction.amount <= transaction_amount_le)
        if transactionsGe or transactionsLe:
            transaction_counts = (
                select(
                    [
                        Transaction.movement_id,
                        func.count(col(Transaction.id)).label("transaction_count"),
                    ]
                )
                .group_by(col(Transaction.movement_id))
                .subquery()
            )
            statement = statement.join(
                transaction_counts, transaction_counts.c.movement_id == cls.id
            )
            if transactionsGe:
                statement = statement.where(
                    transaction_counts.c.transaction_count >= transactionsGe
                )
            if transactionsLe:
                statement = statement.where(
                    transaction_counts.c.transaction_count <= transactionsLe
                )

        # GROUP BY
        statement = statement.group_by(col(Movement.id))

        # ORDER BY
        if sort_by is MovementField.TIMESTAMP:
            # avoid SQL GROUP BY ambiguity by ordering by aggregates
            order_clauses = func.min(Transaction.timestamp), col(Movement.id)
            order = desc if is_descending else asc
            statement = statement.order_by(*(order(c) for c in order_clauses))

        # HAVING
        if start_date:
            statement = statement.having(func.min(Transaction.timestamp) >= start_date)
        if end_date:
            statement = statement.having(func.min(Transaction.timestamp) < end_date)

        # LIMIT OFFSET
        if per_page:
            offset = page * per_page
            statement = statement.offset(offset).limit(per_page)

        return statement

    @classmethod
    def filter_movements(
        cls,
        movements: Iterable["Movement"],
        is_descending: bool,
        sort_by: MovementField,
        amount_gt: Decimal | None = None,
        amount_lt: Decimal | None = None,
    ) -> Iterable["Movement"]:
        if amount_gt is not None:
            movements = [m for m in movements if m.amount_default_currency > amount_gt]

        if amount_lt is not None:
            movements = [m for m in movements if m.amount_default_currency < amount_lt]

        if sort_by is MovementField.AMOUNT:
            movements = sorted(
                movements,
                key=lambda m: m.amount_default_currency,
                reverse=is_descending,
            )

        return movements

    @classmethod
    def get_aggregate(
        cls,
        movements: Iterable["Movement"],
        start_date: date,
        end_date: date,
    ) -> PLStatement:
        income_total = Decimal(0)
        expense_total = Decimal(0)

        for movement in movements:
            amount = movement.amount_default_currency
            if amount >= Decimal(0):
                income_total += amount
            else:
                expense_total += amount

        return PLStatement(
            start_date=start_date,
            end_date=end_date,
            income=income_total,
            expenses=expense_total,
        )
