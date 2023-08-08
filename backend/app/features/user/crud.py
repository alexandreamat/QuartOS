from typing import Iterable, Any
from decimal import Decimal
from datetime import date

from sqlmodel import Session
from sqlalchemy.exc import NoResultFound

from app.utils import get_password_hash
from app.common.crud import CRUDBase
from app.common.exceptions import ObjectNotFoundError

from app.features.userinstitutionlink import UserInstitutionLinkApiOut
from app.features.transaction import TransactionApiOut
from app.features.account import AccountApiOut, Account
from app.features.movement import MovementApiOut, PLStatement, Movement, MovementField
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
        db_obj_in = User(
            **obj_in.dict(exclude={"password"}),
            **kwargs,
            hashed_password=get_password_hash(obj_in.password),
        )
        db_obj_out = User.update(db, id, db_obj_in)
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
        uil = db.exec(statement).one()
        return UserInstitutionLinkApiOut.from_orm(uil)

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
            user_id, userinstitutionlink_id, account_id, movement_id, None, **kwargs
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
        movement_id: int | None,
        transaction_id: int | None,
    ) -> TransactionApiOut:
        statement = User.select_transactions(
            user_id, userinstitutionlink_id, account_id, movement_id, transaction_id
        )
        transaction_out = db.exec(statement).one()
        return TransactionApiOut.from_orm(transaction_out)

    @classmethod
    def read_account(
        cls,
        db: Session,
        user_id: int | None,
        userinstitutionlink_id: int | None,
        account_id: int,
    ) -> AccountApiOut:
        statement = User.select_accounts(user_id, userinstitutionlink_id, account_id)
        try:
            account_out = db.exec(statement).one()
        except NoResultFound:
            raise ObjectNotFoundError("account")
        return AccountApiOut.from_orm(account_out)

    @classmethod
    def read_accounts(
        cls,
        db: Session,
        user_id: int | None,
        userinstitutionlink_id: int | None,
    ) -> Iterable[AccountApiOut]:
        statement = User.select_accounts(user_id, userinstitutionlink_id, None)
        accounts = db.exec(statement).all()

        for a in accounts:
            yield AccountApiOut.from_orm(a)

    @classmethod
    def read_movements(
        cls,
        db: Session,
        user_id: int | None,
        userinstitutionlink_id: int | None,
        account_id: int | None,
        page: int,
        per_page: int | None,
        start_date: date | None,
        end_date: date | None,
        search: str | None,
        is_descending: bool,
        sort_by: MovementField,
        amount_gt: Decimal | None,
        amount_lt: Decimal | None,
    ) -> Iterable[MovementApiOut]:
        statement = User.select_movements(
            user_id,
            userinstitutionlink_id,
            account_id,
            None,
            page=page,
            per_page=per_page,
            start_date=start_date,
            end_date=end_date,
            search=search,
            is_descending=is_descending,
            sort_by=sort_by,
        )
        movements: Iterable[Movement] = db.exec(statement).all()
        movements = Movement.filter_movements(
            movements, amount_gt, amount_lt, is_descending, sort_by
        )
        for m in movements:
            yield MovementApiOut.from_orm(m)

    @classmethod
    def read_movement(
        cls,
        db: Session,
        user_id: int | None,
        userinstitutionlink_id: int | None,
        account_id: int | None,
        movement_id: int,
        **kwargs: Any,
    ) -> MovementApiOut:
        statement = User.select_movements(
            user_id, userinstitutionlink_id, account_id, movement_id, **kwargs
        )
        movement_out = db.exec(statement).one()
        return MovementApiOut.from_orm(movement_out)

    @classmethod
    def get_movement_aggregate(
        cls, db: Session, user_id: int, **kwargs: Any
    ) -> PLStatement:
        return User.get_movement_aggregate(db, user_id, **kwargs)

    @classmethod
    def get_many_movement_aggregates(
        cls, db: Session, user_id: int, **kwargs: Any
    ) -> Iterable[PLStatement]:
        return User.get_many_movement_aggregates(db, user_id, **kwargs)
