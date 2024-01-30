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
from datetime import date
from decimal import Decimal
from typing import Any

from sqlalchemy import select, case, desc, asc
from sqlalchemy.exc import NoResultFound
from sqlmodel import Relationship, Session, col, func, or_
from sqlmodel.sql.expression import SelectOfScalar

from app.common.models import Base
from app.common.utils import filter_query_by_search
from app.features.account import Account
from app.features.category.models import Category
from app.features.merchant.models import Merchant
from app.features.movement import Movement, MovementField
from app.features.transaction import Transaction
from app.features.userinstitutionlink import UserInstitutionLink
from app.utils import verify_password, get_password_hash

logger = logging.getLogger(__name__)


class User(Base, table=True):
    hashed_password: str
    email: str
    full_name: str
    is_superuser: bool
    default_currency_code: str

    institution_links: list[UserInstitutionLink] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )
    noninstitutionalaccounts: list[Account.NonInstitutionalAccount] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )

    @property
    def password(self) -> str:
        raise NotImplementedError

    @password.setter
    def password(self, value: str) -> None:
        self.hashed_password = get_password_hash(value)

    @classmethod
    def read_by_email(cls, db: Session, email: str) -> "User":
        db_user = db.exec(cls.select().where(cls.email == email)).first()
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
    def select_user_institution_links(
        cls, user_id: int | None, userinstitutionlink_id: int | None
    ) -> SelectOfScalar[UserInstitutionLink]:
        statement = UserInstitutionLink.select_user_institution_links(
            userinstitutionlink_id
        )

        statement = statement.join(cls)
        if user_id:
            statement = statement.where(cls.id == user_id)

        return statement

    @classmethod
    def select_merchants(
        cls, user_id: int, *, merchant_id: int | None = None
    ) -> SelectOfScalar[Merchant]:
        statement = Merchant.select().where(Merchant.user_id == user_id)
        if merchant_id:
            statement = statement.where(Merchant.id == merchant_id)
        return statement

    @classmethod
    def select_accounts(
        cls,
        user_id: int | None,
        userinstitutionlink_id: int | None,
        account_id: int | None,
    ) -> SelectOfScalar[Account]:
        statement = Account.select_accounts(account_id)

        if userinstitutionlink_id:
            statement = statement.where(
                UserInstitutionLink.id == userinstitutionlink_id
            )

        statement = statement.outerjoin(UserInstitutionLink).where(
            or_(
                Account.NonInstitutionalAccount.user_id == user_id,
                UserInstitutionLink.user_id == user_id,
            )
        )

        return statement

    @classmethod
    def select_movements(
        cls,
        user_id: int,
        *,
        movement_id: int | None = None,
        category_id: int | None = None,
        page: int = 0,
        search: str | None = None,
        per_page: int | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
        amount_gt: Decimal | None = None,
        amount_lt: Decimal | None = None,
        amount_ge: Decimal | None = None,
        amount_le: Decimal | None = None,
        transactions_ge: int | None = None,
        transactions_le: int | None = None,
        is_descending: bool = True,
        is_amount_abs: bool = False,
        order_by: MovementField = MovementField.TIMESTAMP,
    ) -> Any:
        amount_sum = func.sum(col(Transaction.amount_default_currency))
        timestamp_min = func.min(col(Transaction.timestamp))
        transactions_count = func.count(col(Transaction.id))

        # SELECT
        statement = select(
            col(Movement.id),
            col(Movement.name),
            col(Movement.category_id),
            timestamp_min.label("timestamp"),
            amount_sum.label("amount"),
            transactions_count.label("transactions_count"),
        )

        # JOIN
        statement = (
            statement.join(Account)
            .join(Movement)
            .outerjoin(Category)  # consider uncategorised movements
            .outerjoin(Account.InstitutionalAccount)
            .outerjoin(Account.NonInstitutionalAccount)
            .outerjoin(UserInstitutionLink)
            .outerjoin(User)
        )

        # WHERE
        statement = statement.where(
            or_(
                Account.NonInstitutionalAccount.user_id == user_id,
                UserInstitutionLink.user_id == user_id,
            )
        )
        if movement_id:
            statement = statement.where(col(Movement.id) == movement_id)
        if search:
            statement = filter_query_by_search(search, statement, col(Movement.name))
        if category_id is not None:
            # category_id = 0 represents: WHERE category_id = NULL
            statement = statement.where(
                col(Movement.category_id) == (category_id or None)
            )

        # GROUP BY
        statement = statement.group_by(col(Movement.id))

        # ORDER BY
        order = desc if is_descending else asc
        if order_by is MovementField.AMOUNT:
            statement = statement.order_by(order("amount"), col(Movement.id))
        elif order_by is MovementField.TIMESTAMP:
            statement = statement.order_by(order("timestamp"), col(Movement.id))

        # HAVING
        if start_date:
            statement = statement.having(timestamp_min >= start_date)
        if end_date:
            statement = statement.having(timestamp_min < end_date)
        if is_amount_abs:
            amount_sum = func.abs(amount_sum)
        if amount_gt is not None:
            statement = statement.having(amount_sum > amount_gt)
        if amount_lt is not None:
            statement = statement.having(amount_sum < amount_lt)
        if amount_ge is not None:
            statement = statement.having(amount_sum >= amount_gt)
        if amount_le is not None:
            statement = statement.having(amount_sum <= amount_lt)
        if transactions_ge:
            statement = statement.having(transactions_count >= transactions_ge)
        if transactions_le:
            statement = statement.having(transactions_count <= transactions_le)

        # OFFSET LIMIT
        if per_page:
            offset = page * per_page
            statement = statement.offset(offset).limit(per_page)

        return statement

    @classmethod
    def select_aggregates(
        cls,
        user_id: int,
        year: int | None = None,
        month: int | None = None,
        page: int = 0,
        per_page: int = 12,
    ) -> Any:
        movements_subquery = (
            select(
                col(Transaction.movement_id).label("id"),
                func.min(Transaction.timestamp).label("timestamp"),
                func.sum(Transaction.amount_default_currency).label("amount"),
            )
            .join(Account)
            .outerjoin(Account.InstitutionalAccount)
            .outerjoin(Account.NonInstitutionalAccount)
            .outerjoin(UserInstitutionLink)
            .outerjoin(User)
            .where(
                or_(
                    Account.NonInstitutionalAccount.user_id == user_id,
                    UserInstitutionLink.user_id == user_id,
                )
            )
            .group_by(col(Transaction.movement_id))
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
                            movements_subquery.c.amount < 0,
                            movements_subquery.c.amount,
                        ),
                        else_=0,
                    )
                ).label("expenses"),
                func.sum(
                    case(
                        (
                            movements_subquery.c.amount > 0,
                            movements_subquery.c.amount,
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
                col(Movement.id),
                col(Movement.category_id).label("category_id"),
                func.min(Transaction.timestamp).label("timestamp"),
                func.sum(Transaction.amount_default_currency).label("amount"),
            )
            .join(Account)
            .join(Movement)
            .outerjoin(Account.InstitutionalAccount)
            .outerjoin(Account.NonInstitutionalAccount)
            .outerjoin(UserInstitutionLink)
            .outerjoin(User)
            .where(
                or_(
                    Account.NonInstitutionalAccount.user_id == user_id,
                    UserInstitutionLink.user_id == user_id,
                )
            )
            .group_by(col(Movement.id))
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
    def select_transactions(
        cls,
        user_id: int,
        *,
        account_id: int | None = None,
        movement_id: int | None = None,
        transaction_id: int | None = None,
        **kwargs: Any,
    ) -> SelectOfScalar[Transaction]:
        statement = Account.select_transactions(
            account_id, movement_id=movement_id, transaction_id=transaction_id, **kwargs
        )

        statement = statement.outerjoin(UserInstitutionLink).where(
            or_(
                Account.NonInstitutionalAccount.user_id == user_id,
                UserInstitutionLink.user_id == user_id,
            )
        )
        return statement

    @classmethod
    def update_all_movements(cls, db: Session, user_id: int) -> None:
        for m in db.exec(cls.select_movements(user_id)).all():
            Movement.update(db, m.id)
