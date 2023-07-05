from typing import Iterable

from datetime import datetime
from decimal import Decimal

from sqlmodel import Session, select, or_

from app.common.crud import CRUDBase, CRUDSyncable

from app.features.user import UserApiOut  # type: ignore[attr-defined]
from app.features.account import AccountApiOut, Account, CRUDAccount  # type: ignore[attr-defined]
from app.features.institution import InstitutionApiOut  # type: ignore[attr-defined]
from app.features.userinstitutionlink import UserInstitutionLink  # type: ignore[attr-defined]

from .models import (
    Transaction,
    TransactionApiOut,
    TransactionApiIn,
    TransactionPlaidIn,
    TransactionPlaidOut,
)


class CRUDTransaction(
    CRUDBase[Transaction, TransactionApiOut, TransactionApiIn],
    CRUDSyncable[Transaction, TransactionPlaidOut, TransactionPlaidIn],
):
    db_model = Transaction
    api_out_model = TransactionApiOut
    plaid_out_model = TransactionPlaidOut

    @classmethod
    def read_user(cls, db: Session, id: int) -> UserApiOut:
        return UserApiOut.from_orm(cls.db_model.read(db, id).user)

    @classmethod
    def read_account(cls, db: Session, id: int) -> AccountApiOut:
        return AccountApiOut.from_orm(cls.db_model.read(db, id).account)

    @classmethod
    def read_user_institution_link(cls, db: Session, id: int) -> InstitutionApiOut:
        return InstitutionApiOut.from_orm(cls.db_model.read(db, id).userinstitutionlink)

    @classmethod
    def read_institution(cls, db: Session, id: int) -> InstitutionApiOut:
        return InstitutionApiOut.from_orm(cls.db_model.read(db, id).institution)

    @classmethod
    def read_many_by_institution_link(
        cls, db: Session, userinstitutionlink_id: int
    ) -> Iterable[TransactionApiOut]:
        l = UserInstitutionLink.read(db, userinstitutionlink_id)
        for ia in l.institutionalaccounts:
            for t in ia.account.transactions:
                yield cls.api_out_model.from_orm(t)

    @classmethod
    def read_many_by_user(
        cls,
        db: Session,
        user_id: int,
        page: int,
        per_page: int,
        search: str | None,
        timestamp: datetime | None,
        is_descending: bool,
    ) -> Iterable[TransactionApiOut]:
        statement = (
            select(Transaction)
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
        )
        for t in Transaction.read_from_query(
            db, page, per_page, search, timestamp, is_descending, statement
        ):
            yield cls.api_out_model.from_orm(t)

    @classmethod
    def read_many_by_account(
        cls,
        db: Session,
        account_id: int,
        page: int,
        per_page: int,
        search: str | None,
        timestamp: datetime | None,
        is_descending: bool,
    ) -> Iterable[TransactionApiOut]:
        statement = select(Transaction).join(Account).filter(Account.id == account_id)
        for t in Transaction.read_from_query(
            db, page, per_page, search, timestamp, is_descending, statement
        ):
            yield cls.api_out_model.from_orm(t)

    @classmethod
    def is_synced(cls, db: Session, id: int) -> bool:
        return cls.db_model.read(db, id).is_synced

    @classmethod
    def create(cls, db: Session, transaction_in: TransactionApiIn) -> TransactionApiOut:
        transaction_in.account_balance = Decimal(0)
        transaction_out = super().create(db, transaction_in)
        CRUDAccount.update_balance(
            db, transaction_out.account_id, transaction_out.timestamp
        )
        return transaction_out

    @classmethod
    def update(
        cls, db: Session, id: int, transaction_in: TransactionApiIn
    ) -> TransactionApiOut:
        transaction_in.account_balance = Decimal(0)
        transaction_out = super().update(db, id, transaction_in)
        CRUDAccount.update_balance(
            db, transaction_out.account_id, transaction_out.timestamp
        )
        return transaction_out

    @classmethod
    def delete(cls, db: Session, id: int) -> None:
        transaction = cls.read(db, id)
        super().delete(db, id)
        CRUDAccount.update_balance(db, transaction.account_id, transaction.timestamp)
