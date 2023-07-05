from typing import Iterable

from datetime import datetime

from sqlmodel import Session, asc
from app.common.crud import CRUDBase

from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Query

from app.features.user import User, UserApiOut  # type: ignore[attr-defined]
from app.features.institution import InstitutionApiOut  # type: ignore[attr-defined]
from app.features.userinstitutionlink import UserInstitutionLink  # type: ignore[attr-defined]
from app.features.transactiondeserialiser import TransactionDeserialiserApiOut  # type: ignore[attr-defined]

from .models import (
    Account,
    AccountApiOut,
    AccountApiIn,
    AccountPlaidIn,
    AccountPlaidOut,
)


class CRUDAccount(CRUDBase[Account, AccountApiOut, AccountApiIn]):
    db_model = Account
    api_out_model = AccountApiOut

    @classmethod
    def read_user(cls, db: Session, id: int) -> UserApiOut:
        return UserApiOut.from_orm(Account.read(db, id).user)

    @classmethod
    def read_institution(cls, db: Session, id: int) -> InstitutionApiOut:
        return InstitutionApiOut.from_orm(Account.read(db, id).institution)

    @classmethod
    def read_transaction_deserialiser(
        cls, db: Session, id: int
    ) -> TransactionDeserialiserApiOut:
        db_deserialiser = Account.read(db, id).transactiondeserialiser
        if not db_deserialiser:
            raise NoResultFound
        return TransactionDeserialiserApiOut.from_orm(db_deserialiser)

    @classmethod
    def read_many_by_institution_link(
        cls, db: Session, userinstitutionlink_id: int
    ) -> Iterable[AccountApiOut]:
        l = UserInstitutionLink.read(db, userinstitutionlink_id)
        for ia in l.institutionalaccounts:
            yield AccountApiOut.from_orm(ia.account)

    @classmethod
    def read_many_by_institution_link_plaid(
        cls, db: Session, userinstitutionlink_id: int
    ) -> Iterable[AccountPlaidOut]:
        l = UserInstitutionLink.read(db, userinstitutionlink_id)
        for ia in l.institutionalaccounts:
            yield AccountPlaidOut.from_orm(ia.account)

    @classmethod
    def read_many_by_user(cls, db: Session, user_id: int) -> Iterable[AccountApiOut]:
        db_user = User.read(db, user_id)
        for l in db_user.institution_links:
            for ia in l.institutionalaccounts:
                yield AccountApiOut.from_orm(ia.account)
        for nia in db_user.noninstitutionalaccounts:
            yield AccountApiOut.from_orm(nia.account)

    @classmethod
    def sync(cls, db: Session, account: AccountPlaidIn) -> AccountPlaidOut:
        db_account_in = Account(**account.dict())
        db_account_out = Account.create(db, db_account_in)
        return AccountPlaidOut.from_orm(db_account_out)

    @classmethod
    def is_synced(cls, db: Session, id: int) -> bool:
        return Account.read(db, id).is_synced

    @classmethod
    def update(cls, db: Session, id: int, new_obj: AccountApiIn) -> AccountApiOut:
        super().update(db, id, new_obj)
        return cls.update_balance(db, id)

    @classmethod
    def update_balance(
        cls, db: Session, id: int, timestamp: datetime | None = None
    ) -> AccountApiOut:
        from app.features.transaction.models import (
            Transaction,
            TransactionApiIn,
        )

        account = Account.read(db, id)
        transactions_query: Query = account.transactions  # type: ignore

        if timestamp:
            prev_transaction: Transaction = (
                transactions_query.where(Transaction.timestamp < timestamp)  # type: ignore
                .order_by(*Transaction.get_desc_clauses())
                .first()
            )
            if prev_transaction:
                prev_balance = prev_transaction.account_balance
            else:
                prev_balance = account.initial_balance
            transactions_query = transactions_query.where(
                Transaction.timestamp >= timestamp
            )
        else:
            prev_balance = account.initial_balance

        transactions_query = transactions_query.order_by(
            asc(Transaction.timestamp)
        ).yield_per(100)

        for result in transactions_query:
            transaction: Transaction = result
            transaction.account_balance = prev_balance + transaction.amount
            Transaction.update(db, transaction.id, transaction)
            prev_balance = transaction.account_balance

        return cls.read(db, id)
