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
from typing import Any, Iterable

from dateutil.relativedelta import relativedelta
from sqlalchemy import Select, asc, desc, func, or_, select, case
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from app.crud.common import CRUDBase, CRUDSyncedBase
from app.exceptions.common import ObjectNotFoundError
from app.models.account import Account, NonInstitutionalAccount
from app.models.movement import Movement
from app.models.transaction import Transaction
from app.models.user import User
from app.models.userinstitutionlink import UserInstitutionLink
from app.schemas.file import FileApiOut
from app.schemas.movement import DetailedPLStatementApiOut, PLStatement
from app.schemas.transaction import (
    TransactionApiOut,
    TransactionApiIn,
    TransactionPlaidIn,
    TransactionPlaidOut,
)

logger = logging.getLogger(__name__)


class CRUDTransaction(CRUDBase[Transaction, TransactionApiOut, TransactionApiIn]):
    db_model = Transaction
    out_model = TransactionApiOut

    @classmethod
    def select(cls, user_id: int = 0, **kwargs: Any) -> Select[tuple[Transaction]]:
        statement = super().select(**kwargs)
        if user_id:
            statement = statement.join(Account)
            statement = statement.outerjoin(UserInstitutionLink)
            statement = statement.where(
                or_(
                    NonInstitutionalAccount.user_id == user_id,
                    UserInstitutionLink.user_id == user_id,
                )
            )
        return statement

    @classmethod
    def is_synced(cls, db: Session, transaction_id: int) -> bool:
        return Transaction.read(db, transaction_id).is_synced

    @classmethod
    def read_files(cls, db: Session, transaction_id: int) -> Iterable[FileApiOut]:
        for f in Transaction.read(db, transaction_id).files:
            yield FileApiOut.model_validate(f)

    @classmethod
    def orphan_only_children(cls, db: Session) -> None:
        for t in db.scalars(cls.select()).all():
            if not t.movement_id or not t.movement:
                continue
            if len(t.movement.transactions) > 1:
                continue
            t.movement.delete(db, t.movement_id)

    @classmethod
    def update(
        cls, db: Session, id: int, obj_in: TransactionApiIn, **kwargs: Any
    ) -> TransactionApiOut:
        transaction = Transaction.update(db, id, **obj_in.model_dump(), **kwargs)
        if movement := transaction.movement:
            movement.update(db, movement.id)
        return TransactionApiOut.model_validate(transaction)

    @classmethod
    def delete(cls, db: Session, id: int) -> int:
        movement = Transaction.read(db, id).movement
        if movement:
            if len(movement.transactions) <= 2:
                movement.delete(db, movement.id)
        return super().delete(db, id)

    @classmethod
    def select_aggregates(
        cls,
        user_id: int,
        year: int | None = None,
        month: int | None = None,
        page: int = 0,
        per_page: int = 12,
    ) -> Select[tuple[int, int, Decimal, Decimal]]:
        movements_subquery = (
            select(Movement.id, Movement.timestamp, Movement.amount_default_currency)
            .join(Transaction)
            .join(Account)
            .outerjoin(UserInstitutionLink)
            .outerjoin(User)
            .where(
                or_(
                    NonInstitutionalAccount.user_id == user_id,
                    UserInstitutionLink.user_id == user_id,
                )
            )
            .group_by(Movement.id)
            .subquery()
        )

        year_extract = func.extract("year", movements_subquery.c.timestamp)
        month_extract = func.extract("month", movements_subquery.c.timestamp)

        aggregates_query = (
            select(
                year_extract.label("year"),
                month_extract.label("month"),
                func.sum(
                    case(
                        (
                            movements_subquery.c.amount_default_currency < 0,
                            movements_subquery.c.amount_default_currency,
                        ),
                        else_=0,
                    )
                ).label("expenses"),
                func.sum(
                    case(
                        (
                            movements_subquery.c.amount_default_currency > 0,
                            movements_subquery.c.amount_default_currency,
                        ),
                        else_=0,
                    )
                ).label("income"),
            )
            .group_by("year", "month")
            .order_by(desc("year"), desc("month"))
        )

        if year:
            aggregates_query = aggregates_query.having(year_extract == year)

        if month:
            aggregates_query = aggregates_query.having(month_extract == month)

        if per_page:
            offset = page * per_page
            aggregates_query = aggregates_query.offset(offset).limit(per_page)

        return aggregates_query

    @classmethod
    def select_detailed_aggregates(cls, user_id: int, year: int, month: int) -> Any:
        movements_subquery = (
            select(
                Movement.id,
                Movement.category_id.label("category_id"),
                func.min(Transaction.timestamp).label("timestamp"),
                func.sum(Transaction.amount_default_currency).label("amount"),
            )
            .join(Account)
            .join(Movement)
            .outerjoin(UserInstitutionLink)
            .outerjoin(User)
            .where(
                or_(
                    NonInstitutionalAccount.user_id == user_id,
                    UserInstitutionLink.user_id == user_id,
                )
            )
            .group_by(Movement.id)
            .subquery()
        )

        year_extract = func.extract("year", movements_subquery.c.timestamp)
        month_extract = func.extract("month", movements_subquery.c.timestamp)
        amount_sign = func.sign(movements_subquery.c.amount)
        amount_sum = func.sum(movements_subquery.c.amount)

        aggregates_query = (
            select(
                year_extract.label("year"),
                month_extract.label("month"),
                amount_sign.label("sign"),
                movements_subquery.c.category_id.label("category_id"),
                amount_sum.label("amount"),
            )
            .group_by(
                "year",
                "month",
                amount_sign,
                movements_subquery.c.category_id,
            )
            .order_by(
                desc("year"),
                desc("month"),
                asc(movements_subquery.c.category_id),
                asc("sign"),
            )
        )

        aggregates_query = aggregates_query.having(year_extract == year)
        aggregates_query = aggregates_query.having(month_extract == month)

        return aggregates_query

    @classmethod
    def get_pl_statement(
        cls,
        db: Session,
        user_id: int,
        start_date: date,
    ) -> PLStatement:
        statement = cls.select_aggregates(user_id, start_date.year, start_date.month)
        try:
            result = db.scalars(statement).one()
        except NoResultFound:
            raise ObjectNotFoundError("PLStatement")
        year = int(result.year)
        month = int(result.month)
        expenses = result.expenses
        income = result.income
        return PLStatement(
            start_date=date(year, month, 1),
            end_date=date(year, month, 1) + relativedelta(months=1),
            expenses=expenses,
            income=income,
        )

    @classmethod
    def get_many_pl_statements(
        cls,
        db: Session,
        user_id: int,
        page: int,
        per_page: int,
    ) -> Iterable[PLStatement]:
        statement = cls.select_aggregates(user_id, None, None, page, per_page)
        for result in db.execute(statement):
            year = int(result.year)
            month = int(result.month)
            expenses = result.expenses
            income = result.income
            yield PLStatement(
                start_date=date(year, month, 1),
                end_date=date(year, month, 1) + relativedelta(months=1),
                expenses=expenses,
                income=income,
            )

    @classmethod
    def get_detailed_pl_statement(
        cls,
        db: Session,
        user_id: int,
        start_date: date,
    ) -> DetailedPLStatementApiOut:
        statement = cls.select_detailed_aggregates(
            user_id, start_date.year, start_date.month
        )
        by_category: dict[int, dict[int | None, Decimal]] = defaultdict(
            lambda: defaultdict(Decimal)
        )
        totals: dict[int, Decimal] = defaultdict(Decimal)

        for result in db.execute(statement).all():
            by_category[result.sign][result.category_id or 0] += result.amount
            totals[result.sign] += result.amount

        return DetailedPLStatementApiOut(
            start_date=date(start_date.year, start_date.month, 1),
            end_date=date(start_date.year, start_date.month, 1)
            + relativedelta(months=1),
            income_by_category=by_category[1],
            expenses_by_category=by_category[-1],
            income=totals[1],
            expenses=totals[-1],
        )


class CRUDSyncableTransaction(
    CRUDSyncedBase[Transaction, TransactionPlaidOut, TransactionPlaidIn],
):
    db_model = Transaction
    out_model = TransactionPlaidOut
