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

import logging
from collections import defaultdict
from datetime import date
from decimal import Decimal
from functools import wraps
from typing import Any, Callable, Iterable, TypeVar, cast

from dateutil.relativedelta import relativedelta
from sqlalchemy import ColumnElement, Select, Subquery, asc, desc, func, select, case
from sqlalchemy.orm import Session

from app.crud.consolidatedtransaction import CRUDConsolidatedTransaction
from app.schemas.transactiongroup import DetailedPLStatementApiOut, PLStatementApiOut

logger = logging.getLogger(__name__)

FuncT = TypeVar("FuncT", bound=Callable[..., ColumnElement[Any]])


def labeled(func: FuncT) -> FuncT:
    @wraps(func)
    def wrapped(*args: Any, **kwargs: Any) -> Any:
        return func(*args, **kwargs).label(func.__name__)

    return cast(FuncT, wrapped)


class TransactionsSubquery:
    def __init__(self, subquery: Subquery) -> None:
        self.subquery = subquery

    def __getattribute__(self, __name: str) -> Any:
        try:
            return super().__getattribute__(__name)
        except AttributeError:
            sq = super().__getattribute__("subquery")
            return getattr(sq.c, __name)

    @property
    @labeled
    def year(self) -> ColumnElement[int]:
        return func.extract("year", self.timestamp)

    @property
    @labeled
    def month(self) -> ColumnElement[int]:
        return func.extract("month", self.timestamp)

    @property
    @labeled
    def expenses(self) -> ColumnElement[Decimal]:
        return func.sum(
            case(
                (
                    self.subquery.c.amount_default_currency < 0,
                    self.subquery.c.amount_default_currency,
                ),
                else_=0,
            )
        )

    @property
    @labeled
    def income(self) -> ColumnElement[Decimal]:
        return func.sum(
            case(
                (
                    self.subquery.c.amount_default_currency > 0,
                    self.subquery.c.amount_default_currency,
                ),
                else_=0,
            )
        )

    @property
    @labeled
    def sign(self) -> ColumnElement[int]:
        return func.sign(self.amount)

    @property
    @labeled
    def amount_default_currency(self) -> ColumnElement[Decimal]:
        return func.sum(self.subquery.c.amount_default_currency)


class CRUDPLStatement:
    @classmethod
    def select_pl_statements(
        cls,
        *,
        user_id: int,
        page: int = 0,
        per_page: int = 12,
    ) -> Select[tuple[int, int, Decimal, Decimal]]:
        transactions_query = CRUDConsolidatedTransaction.select(
            user_id=user_id, consolidated=True
        )

        transactions_subquery = TransactionsSubquery(transactions_query.subquery())

        pl_statements_query = (
            select(
                transactions_subquery.year,
                transactions_subquery.month,
                transactions_subquery.expenses,
                transactions_subquery.income,
            )
            .group_by("year", "month")
            .order_by(desc("year"), desc("month"))
        )

        if per_page:
            offset = page * per_page
            pl_statements_query = pl_statements_query.offset(offset).limit(per_page)

        return pl_statements_query

    @classmethod
    def select_detailed_pl_statement(cls, **kwargs: Any) -> Any:
        transactions_query = CRUDConsolidatedTransaction.select(
            consolidated=True, **kwargs
        )
        transactions_subquery = TransactionsSubquery(transactions_query.subquery())

        detailed_pl_statement_query = (
            select(
                transactions_subquery.sign,
                transactions_subquery.category_id,
                transactions_subquery.amount_default_currency,
            )
            .group_by("sign", "category_id")
            .order_by(asc("category_id"), asc("sign"))
        )

        return detailed_pl_statement_query

    @classmethod
    def get_many_pl_statements(
        cls, db: Session, **kwargs: Any
    ) -> Iterable[PLStatementApiOut]:
        statement = cls.select_pl_statements(**kwargs)
        for result in db.execute(statement):
            year = int(result.year)
            month = int(result.month)
            expenses = result.expenses
            income = result.income
            yield PLStatementApiOut(
                timestamp__ge=date(year, month, 1),
                timestamp__lt=date(year, month, 1) + relativedelta(months=1),
                expenses=expenses,
                income=income,
            )

    @classmethod
    def get_detailed_pl_statement(
        cls, db: Session, timestamp__ge: date, timestamp__lt: date, **kwargs: Any
    ) -> DetailedPLStatementApiOut:
        statement = cls.select_detailed_pl_statement(
            timestamp__ge=timestamp__ge, timestamp__lt=timestamp__lt, **kwargs
        )
        by_category: dict[int, dict[int, Decimal]] = defaultdict(
            lambda: defaultdict(Decimal)
        )
        totals: dict[int, Decimal] = defaultdict(Decimal)

        for transaction in db.execute(statement).all():
            by_category[transaction.sign][
                transaction.category_id or 0
            ] += transaction.amount_default_currency
            totals[transaction.sign] += transaction.amount_default_currency

        return DetailedPLStatementApiOut(
            timestamp__ge=timestamp__ge,
            timestamp__lt=timestamp__lt,
            income_by_category=by_category[1],
            expenses_by_category=by_category[-1],
            income=totals[1],
            expenses=totals[-1],
        )
