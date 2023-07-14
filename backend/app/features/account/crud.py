from typing import Iterable, Any

from datetime import date

from sqlmodel import Session
from sqlalchemy.exc import NoResultFound

from app.common.crud import CRUDBase

from app.features.transaction import TransactionApiOut
from app.features.transactiondeserialiser import TransactionDeserialiserApiOut

from .models import (
    Account,
    AccountApiOut,
    AccountApiIn,
    AccountPlaidIn,
    AccountPlaidOut,
)


class CRUDAccount(CRUDBase[Account, AccountApiOut, AccountApiIn]):
    db_model = Account
    out_model = AccountApiOut

    @classmethod
    def read_user_id(cls, db: Session, id: int) -> int:
        return Account.read(db, id).user.id

    @classmethod
    def read_transactions(
        cls, db: Session, id: int, *args: Any, **kwargs: Any
    ) -> Iterable[TransactionApiOut]:
        for t in Account.read_transactions(db, id, *args, **kwargs):
            yield TransactionApiOut.from_orm(t)

    @classmethod
    def read_transaction_deserialiser(
        cls, db: Session, id: int
    ) -> TransactionDeserialiserApiOut:
        db_deserialiser = Account.read(db, id).transactiondeserialiser
        if not db_deserialiser:
            raise NoResultFound
        return TransactionDeserialiserApiOut.from_orm(db_deserialiser)

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
        account_out = Account.update_balance(db, id)
        return AccountApiOut.from_orm(account_out)

    @classmethod
    def update_balance(
        cls, db: Session, id: int, timestamp: date | None = None
    ) -> AccountApiOut:
        account_out = Account.update_balance(db, id, timestamp)
        return AccountApiOut.from_orm(account_out)
