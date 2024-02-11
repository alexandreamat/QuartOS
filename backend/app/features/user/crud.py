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
from typing import Iterable, Any

from dateutil.relativedelta import relativedelta
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from app.common.crud import CRUDBase
from app.common.exceptions import ObjectNotFoundError
from app.features.account import AccountApiOut, Account
from app.features.merchant import MerchantApiOut
from app.features.movement import DetailedPLStatementApiOut
from app.features.movement import (
    MovementApiOut,
    MovementApiIn,
    PLStatement,
    Movement,
    MovementField,
)
from app.features.transaction import TransactionApiOut, Transaction
from app.features.userinstitutionlink import (
    UserInstitutionLinkApiOut,
    UserInstitutionLink,
)
from .models import User
from .schemas import UserApiOut, UserApiIn

logger = logging.getLogger(__name__)


class CRUDUser(CRUDBase[User, UserApiOut, UserApiIn]):
    db_model = User
    out_model = UserApiOut

    @classmethod
    def read_by_email(cls, db: Session, email: str) -> UserApiOut:
        return UserApiOut.model_validate(User.read_by_email(db, email=email))

    @classmethod
    def authenticate(cls, db: Session, email: str, password: str) -> UserApiOut:
        return UserApiOut.model_validate(User.authenticate(db, email, password))

    @classmethod
    def read_user_institution_links(
        cls, db: Session, user_id: int | None
    ) -> Iterable[UserInstitutionLinkApiOut]:
        statement = User.select_user_institution_links(user_id, None)
        uils = db.scalars(statement).all()
        for uil in uils:
            yield UserInstitutionLinkApiOut.model_validate(uil)

    @classmethod
    def read_user_institution_link(
        cls,
        db: Session,
        user_id: int | None,
        userinstitutionlink_id: int,
    ) -> UserInstitutionLinkApiOut:
        statement = User.select_user_institution_links(user_id, userinstitutionlink_id)
        uil = UserInstitutionLink.read_one_from_query(
            db, statement, userinstitutionlink_id
        )
        return UserInstitutionLinkApiOut.model_validate(uil)

    @classmethod
    def update_movement(
        cls,
        db: Session,
        user_id: int,
        movement_id: int,
        movement_in: MovementApiIn,
    ) -> MovementApiOut:
        user_out = cls.read(db, user_id)
        movement = Movement.update(db, movement_id, **movement_in.model_dump())
        return MovementApiOut.model_validate(movement)

    @classmethod
    def read_merchants(cls, db: Session, user_id: int) -> Iterable[MerchantApiOut]:
        statement = User.select_merchants(user_id)
        merchants = db.scalars(statement).all()
        for merchant in merchants:
            yield MerchantApiOut.model_validate(merchant)

    @classmethod
    def read_merchant(
        cls, db: Session, user_id: int, merchant_id: int
    ) -> MerchantApiOut:
        statement = User.select_merchants(user_id, merchant_id=merchant_id)
        merchant = db.scalars(statement).one()
        return MerchantApiOut.model_validate(merchant)

    @classmethod
    def read_transactions(
        cls,
        db: Session,
        user_id: int,
        *,
        account_id: int | None = None,
        movement_id: int | None = None,
        **kwargs: Any,
    ) -> Iterable[TransactionApiOut]:
        statement = User.select_transactions(
            user_id,
            account_id=account_id,
            movement_id=movement_id,
            **kwargs,
        )

        for t in db.scalars(statement):
            yield TransactionApiOut.model_validate(t)

    @classmethod
    def read_transaction(
        cls,
        db: Session,
        user_id: int,
        transaction_id: int,
        *,
        account_id: int | None = None,
        movement_id: int | None = None,
    ) -> TransactionApiOut:
        statement = User.select_transactions(
            user_id,
            account_id=account_id,
            movement_id=movement_id,
            transaction_id=transaction_id,
        )
        transaction = Transaction.read_one_from_query(db, statement, transaction_id)
        return TransactionApiOut.model_validate(transaction)

    @classmethod
    def read_account(
        cls,
        db: Session,
        user_id: int | None,
        userinstitutionlink_id: int | None,
        account_id: int,
    ) -> AccountApiOut:
        statement = User.select_accounts(user_id, userinstitutionlink_id, account_id)
        account = Account.read_one_from_query(db, statement, account_id)
        return AccountApiOut.model_validate(account)

    @classmethod
    def read_accounts(
        cls,
        db: Session,
        user_id: int | None,
        userinstitutionlink_id: int | None,
    ) -> Iterable[AccountApiOut]:
        statement = User.select_accounts(user_id, userinstitutionlink_id, None)
        accounts = db.scalars(statement).all()

        for a in accounts:
            yield AccountApiOut.model_validate(a)

    @classmethod
    def read_movements(
        cls,
        db: Session,
        user_id: int,
        *,
        category_id: int | None = None,
        page: int = 0,
        per_page: int | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
        search: str | None = None,
        is_descending: bool = True,
        is_amount_abs: bool = False,
        transactions_ge: int | None = None,
        transactions_le: int | None = None,
        amount_gt: Decimal | None = None,
        amount_lt: Decimal | None = None,
        amount_ge: Decimal | None = None,
        amount_le: Decimal | None = None,
        order_by: MovementField = MovementField.TIMESTAMP,
    ) -> Iterable[MovementApiOut]:
        statement = User.select_movements(
            user_id,
            category_id=category_id,
            page=page,
            per_page=per_page,
            start_date=start_date,
            end_date=end_date,
            amount_gt=amount_gt,
            amount_lt=amount_lt,
            is_descending=is_descending,
            amount_ge=amount_ge,
            amount_le=amount_le,
            is_amount_abs=is_amount_abs,
            order_by=order_by,
            search=search,
            transactions_ge=transactions_ge,
            transactions_le=transactions_le,
        )
        for result in db.scalars(statement):
            yield MovementApiOut.model_validate(result)

    @classmethod
    def read_movement(
        cls,
        db: Session,
        user_id: int,
        movement_id: int,
    ) -> MovementApiOut:
        cls.read(db, user_id)
        statement = User.select_movements(user_id, movement_id=movement_id)
        movement = Movement.read_one_from_query(db, statement, movement_id)
        return MovementApiOut.model_validate(movement)

    @classmethod
    def update_all_movements(cls, db: Session, user_id: int) -> None:
        User.update_all_movements(db, user_id)

    @classmethod
    def get_pl_statement(
        cls,
        db: Session,
        user_id: int,
        start_date: date,
    ) -> PLStatement:
        statement = User.select_aggregates(user_id, start_date.year, start_date.month)
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
        statement = User.select_aggregates(user_id, None, None, page, per_page)
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
        statement = User.select_detailed_aggregates(
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
