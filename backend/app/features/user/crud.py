from typing import Iterable, Any
from decimal import Decimal
from datetime import date
from dateutil.relativedelta import relativedelta

from sqlmodel import Session

from app.utils import get_password_hash
from app.common.crud import CRUDBase
from app.common.models import CurrencyCode

from app.features.userinstitutionlink import (
    UserInstitutionLinkApiOut,
    UserInstitutionLink,
)
from app.features.transaction import TransactionApiOut, Transaction
from app.features.account import AccountApiOut, Account, CRUDAccount
from app.features.movement import (
    MovementApiOut,
    MovementApiIn,
    PLStatement,
    Movement,
    MovementField,
)
from app.features.user import UserApiIn, UserApiOut

from .models import User, UserApiOut, UserApiIn


class CRUDUser(CRUDBase[User, UserApiOut, UserApiIn]):
    db_model = User
    out_model = UserApiOut

    @classmethod
    def create(cls, db: Session, obj_in: UserApiIn, **_: Any) -> UserApiOut:
        hashed_password = get_password_hash(obj_in.password)
        del obj_in.password
        db_obj_in = User.from_schema(obj_in)
        db_obj_in.hashed_password = hashed_password
        db_obj_out = User.create(db, db_obj_in)
        return UserApiOut.from_orm(db_obj_out)

    @classmethod
    def read_by_email(cls, db: Session, email: str) -> UserApiOut:
        return UserApiOut.from_orm(User.read_by_email(db, email=email))

    @classmethod
    def update(
        cls, db: Session, id: int, obj_in: UserApiIn, **kwargs: Any
    ) -> UserApiOut:
        db_obj_out = User.update(
            db,
            id,
            **obj_in.dict(exclude={"password"}),
            **kwargs,
            hashed_password=get_password_hash(obj_in.password),
        )
        return UserApiOut.from_orm(db_obj_out)

    @classmethod
    def authenticate(cls, db: Session, email: str, password: str) -> UserApiOut:
        return UserApiOut.from_orm(User.authenticate(db, email, password))

    @classmethod
    def read_user_institution_links(
        cls, db: Session, user_id: int | None
    ) -> Iterable[UserInstitutionLinkApiOut]:
        statement = User.select_user_institution_links(user_id, None)
        uils = db.exec(statement).all()
        for uil in uils:
            yield UserInstitutionLinkApiOut.from_orm(uil)

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
        return UserInstitutionLinkApiOut.from_orm(uil)

    @classmethod
    def update_movement(
        cls,
        db: Session,
        user_id: int,
        movement_id: int,
        movement_in: MovementApiIn,
    ) -> MovementApiOut:
        user_out = cls.read(db, user_id)
        movement = Movement.update(db, movement_id, **movement_in.dict())
        return MovementApiOut.from_orm(
            movement, {"amount": movement.get_amount(user_out.default_currency_code)}
        )

    @classmethod
    def read_transactions(
        cls,
        db: Session,
        user_id: int,
        userinstitutionlink_id: int | None,
        account_id: int | None,
        movement_id: int | None,
        **kwargs: Any,
    ) -> Iterable[TransactionApiOut]:
        statement = User.select_transactions(
            user_id,
            userinstitutionlink_id,
            account_id,
            None,
            movement_id,
            None,
            **kwargs,
        )

        for t in db.exec(statement).all():
            yield TransactionApiOut.from_orm(t)

    @classmethod
    def read_transaction(
        cls,
        db: Session,
        user_id: int | None,
        userinstitutionlink_id: int | None,
        account_id: int | None,
        accountaccess_id: int | None,
        movement_id: int | None,
        transaction_id: int,
    ) -> TransactionApiOut:
        statement = User.select_transactions(
            user_id,
            userinstitutionlink_id,
            account_id,
            accountaccess_id,
            movement_id,
            transaction_id,
        )
        transaction = Transaction.read_one_from_query(db, statement, transaction_id)
        return TransactionApiOut.from_orm(transaction)

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
        return CRUDAccount.from_orm(account)

    @classmethod
    def read_accounts(
        cls,
        db: Session,
        user_id: int | None,
        userinstitutionlink_id: int | None,
    ) -> Iterable[AccountApiOut]:
        statement = User.select_accounts(user_id, userinstitutionlink_id, None)
        accounts = db.exec(statement).all()

        for account in accounts:
            yield CRUDAccount.from_orm(account)

    @classmethod
    def read_movements(
        cls,
        db: Session,
        user_id: int,
        userinstitutionlink_id: int | None = None,
        account_id: int | None = None,
        accountaccess_id: int | None = None,
        page: int = 0,
        per_page: int | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
        search: str | None = None,
        is_descending: bool = True,
        transaction_amount_ge: Decimal | None = None,
        transaction_amount_le: Decimal | None = None,
        is_amount_abs: bool = False,
        transactions_ge: int | None = None,
        transactions_le: int | None = None,
        amount_gt: Decimal | None = None,
        amount_lt: Decimal | None = None,
        sort_by: MovementField = MovementField.TIMESTAMP,
    ) -> Iterable[MovementApiOut]:
        statement = User.select_movements(
            user_id=user_id,
            userinstitutionlink_id=userinstitutionlink_id,
            account_id=account_id,
            accountaccess_id=accountaccess_id,
            movement_id=None,
            page=page,
            per_page=per_page,
            start_date=start_date,
            end_date=end_date,
            search=search,
            is_descending=is_descending,
            transaction_amount_ge=transaction_amount_ge,
            transaction_amount_le=transaction_amount_le,
            is_amount_abs=is_amount_abs,
            transactions_ge=transactions_ge,
            transactions_le=transactions_le,
            sort_by=sort_by,
        )
        movements: Iterable[Movement] = db.exec(statement).all()
        user_out = cls.read(db, user_id)
        currency_code = user_out.default_currency_code
        movements = Movement.filter_movements(
            movements,
            is_descending,
            sort_by,
            currency_code,
            amount_gt=amount_gt,
            amount_lt=amount_lt,
        )
        for movement in movements:
            yield MovementApiOut.from_orm(
                movement,
                {"amount": movement.get_amount(currency_code)},
            )

    @classmethod
    def read_movement(
        cls,
        db: Session,
        user_id: int,
        userinstitutionlink_id: int | None,
        account_id: int | None,
        accountaccess_id: int | None,
        movement_id: int,
        **kwargs: Any,
    ) -> MovementApiOut:
        user_out = cls.read(db, user_id)
        statement = User.select_movements(
            user_id,
            userinstitutionlink_id,
            account_id,
            accountaccess_id,
            movement_id,
            **kwargs,
        )
        movement = Movement.read_one_from_query(db, statement, movement_id)
        return MovementApiOut.from_orm(
            movement, {"amount": movement.get_amount(user_out.default_currency_code)}
        )

    @classmethod
    def get_movement_aggregate(
        cls,
        db: Session,
        user_id: int,
        start_date: date,
        end_date: date,
        currency_code: CurrencyCode | None = None,
    ) -> PLStatement:
        statement = User.select_movements(
            user_id=user_id,
            userinstitutionlink_id=None,
            account_id=None,
            accountaccess_id=None,
            movement_id=None,
            start_date=start_date,
            end_date=end_date,
        )
        movements = db.exec(statement).all()
        if not currency_code:
            user_out = cls.read(db, user_id)
            currency_code = user_out.default_currency_code
        return Movement.get_aggregate(
            movements,
            start_date=start_date,
            end_date=end_date,
            currency_code=currency_code,
        )

    @classmethod
    def get_many_movement_aggregates(
        cls,
        db: Session,
        user_id: int,
        page: int,
        per_page: int,
    ) -> Iterable[PLStatement]:
        user_out = cls.read(db, user_id)
        today = date.today()
        last_start_date = today.replace(day=1)
        offset = per_page * page
        for i in range(offset, offset + per_page):
            start_date = last_start_date - relativedelta(months=i)
            end_date = min(
                start_date + relativedelta(months=1),
                today + relativedelta(days=1),
            )
            yield cls.get_movement_aggregate(
                db,
                user_id,
                start_date=start_date,
                end_date=end_date,
                currency_code=user_out.default_currency_code,
            )
