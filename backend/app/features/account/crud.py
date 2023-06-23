from datetime import datetime

from sqlmodel import Session, asc, desc
from app.common.crud import CRUDBase

from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Query

from app.features import user, institution, userinstitutionlink, transactiondeserialiser

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
    def read_user(cls, db: Session, id: int) -> user.models.UserApiOut:
        return user.models.UserApiOut.from_orm(Account.read(db, id).user)

    @classmethod
    def read_institution(
        cls, db: Session, id: int
    ) -> institution.models.InstitutionApiOut:
        return institution.models.InstitutionApiOut.from_orm(
            Account.read(db, id).institution
        )

    @classmethod
    def read_transaction_deserialiser(
        cls, db: Session, id: int
    ) -> transactiondeserialiser.models.TransactionDeserialiserApiOut:
        db_deserialiser = Account.read(db, id).transactiondeserialiser
        if not db_deserialiser:
            raise NoResultFound
        return transactiondeserialiser.models.TransactionDeserialiserApiOut.from_orm(
            db_deserialiser
        )

    @classmethod
    def read_many_by_institution_link(
        cls, db: Session, userinstitutionlink_id: int
    ) -> list[AccountApiOut]:
        l = userinstitutionlink.models.UserInstitutionLink.read(
            db, userinstitutionlink_id
        )
        return [AccountApiOut.from_orm(ia.account) for ia in l.institutionalaccounts]

    @classmethod
    def read_many_by_institution_link_plaid(
        cls, db: Session, userinstitutionlink_id: int
    ) -> list[AccountPlaidOut]:
        l = userinstitutionlink.models.UserInstitutionLink.read(
            db, userinstitutionlink_id
        )
        return [AccountPlaidOut.from_orm(ia.account) for ia in l.institutionalaccounts]

    @classmethod
    def read_many_by_user(cls, db: Session, user_id: int) -> list[AccountApiOut]:
        db_user = user.models.User.read(db, user_id)
        return [
            AccountApiOut.from_orm(ia.account)
            for l in db_user.institution_links
            for ia in l.institutionalaccounts
        ] + [
            AccountApiOut.from_orm(nia.account)
            for nia in db_user.noninstitutionalaccounts
        ]

    @classmethod
    def sync(cls, db: Session, account: AccountPlaidIn) -> AccountPlaidOut:
        db_account_in = Account(**account.dict())
        db_account_out = Account.create_or_update(db, db_account_in)
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
                .order_by(desc(Transaction.timestamp), desc(Transaction.id))
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
            transaction_in = TransactionApiIn(**transaction.dict())
            transaction_in.account_balance = prev_balance + transaction.amount
            Transaction.update(db, transaction.id, transaction_in)
            prev_balance = transaction.account_balance

        return cls.read(db, id)
