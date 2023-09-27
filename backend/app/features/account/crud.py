from typing import Any, Iterable, Type

from datetime import date
from decimal import Decimal

from sqlmodel import Session

from app.common.crud import CRUDBase, CRUDSyncedBase
from app.common.exceptions import ObjectNotFoundError

from app.features.transactiondeserialiser import (
    TransactionDeserialiserApiOut,
    TransactionDeserialiser,
)
from app.features.movement import (
    MovementApiOut,
    CRUDMovement,
)
from app.features.transaction import (
    TransactionApiOut,
    TransactionApiIn,
    TransactionPlaidIn,
    Transaction,
)


from .models import (
    Account,
    CashApiOut,
    CreditApiOut,
    DepositoryApiOut,
    LoanApiOut,
    PersonalLedgerApiOut,
    PropertyApiOut,
    AccountApiOut,
    AccountApiIn,
    DepositoryPlaidOut,
    LoanPlaidOut,
    CreditPlaidOut,
    AccountPlaidIn,
    AccountPlaidOut,
)


class CRUDAccount(CRUDBase[Account, AccountApiOut, AccountApiIn]):
    db_model = Account

    OUT_MODELS: dict[str, Type[AccountApiOut]] = {
        "cash": CashApiOut,
        "credit": CreditApiOut,
        "depository": DepositoryApiOut,
        "loan": LoanApiOut,
        "personal_ledger": PersonalLedgerApiOut,
        "property": PropertyApiOut,
    }

    @classmethod
    def create(cls, db: Session, obj_in: AccountApiIn, **kwargs: Any) -> AccountApiOut:
        account = cls.db_model.from_schema(obj_in, **kwargs)
        account = cls.db_model.create(db, account)
        return cls.from_orm(account)

    @classmethod
    def read(cls, db: Session, id: int) -> AccountApiOut:
        account = cls.db_model.read(db, id)
        return cls.from_orm(account)

    @classmethod
    def read_many(
        cls,
        db: Session,
        offset: int,
        limit: int,
    ) -> Iterable[AccountApiOut]:
        for account in cls.db_model.read_many(db, offset, limit):
            yield cls.from_orm(account)

    @classmethod
    def update(
        cls, db: Session, id: int, account_in: AccountApiIn, **kwargs: Any
    ) -> AccountApiOut:
        account = cls.db_model.update(db, id, **account_in.dict(), **kwargs)
        cls.update_balance(db, id)
        return cls.from_orm(account)

    @classmethod
    def from_orm(cls, account: Account) -> AccountApiOut:
        return cls.OUT_MODELS[account.type].from_orm(account)

    @classmethod
    def read_transaction_deserialiser(
        cls, db: Session, id: int
    ) -> TransactionDeserialiserApiOut:
        deserialiser = Account.read(db, id).transactiondeserialiser
        if not deserialiser:
            raise ObjectNotFoundError(str(TransactionDeserialiser.__tablename__), 0)
        return TransactionDeserialiserApiOut.from_orm(deserialiser)

    @classmethod
    def update_balance(
        cls,
        db: Session,
        id: int,
        timestamp: date | None = None,
    ) -> AccountApiOut:
        account = Account.update_balance(db, id, timestamp)
        return cls.from_orm(account)

    @classmethod
    def create_many_movements(
        cls,
        db: Session,
        account_id: int,
        transactions: list[TransactionApiIn],
        transaction_ids: list[int],
    ) -> Iterable[MovementApiOut]:
        min_timestamp = None
        for transaction_in in transactions:
            if min_timestamp:
                min_timestamp = min(transaction_in.timestamp, min_timestamp)
            else:
                min_timestamp = transaction_in.timestamp
            yield CRUDMovement.create(
                db, [transaction_in], account_id=account_id, account_balance=Decimal(0)
            )
        for transaction_id in transaction_ids:
            transaction_out = cls.read_transaction(db, account_id, None, transaction_id)
            if min_timestamp:
                min_timestamp = min(transaction_out.timestamp, min_timestamp)
            else:
                min_timestamp = transaction_out.timestamp
            yield CRUDMovement.create(db, [transaction_id])
        CRUDAccount.update_balance(db, account_id, min_timestamp)

    @classmethod
    def create_movement_plaid(
        cls,
        db: Session,
        account_id: int,
        transaction_in: TransactionPlaidIn,
    ) -> MovementApiOut:
        movement_out = CRUDMovement.create_plaid(
            db, transaction_in, account_id=account_id, account_balance=Decimal(0)
        )
        CRUDAccount.update_balance(db, account_id, transaction_in.timestamp)
        return movement_out

    @classmethod
    def create_transaction(
        cls,
        db: Session,
        account_id: int,
        movement_id: int,
        transaction_in: TransactionApiIn,
    ) -> TransactionApiOut:
        transaction_out = CRUDMovement.create_transaction(
            db,
            movement_id,
            transaction_in,
            account_id=account_id,
            account_balance=Decimal(0),
        )
        cls.update_balance(db, account_id, transaction_in.timestamp)
        return transaction_out

    @classmethod
    def update_transaction(
        cls,
        db: Session,
        account_id: int,
        movement_id: int,
        transaction_id: int,
        transaction_in: TransactionApiIn,
        new_movement_id: int,
    ) -> TransactionApiOut:
        cls.read_transaction(db, account_id, movement_id, transaction_id)
        transaction_out = CRUDMovement.update_transaction(
            db,
            movement_id,
            transaction_id,
            transaction_in,
            new_movement_id,
            account_id=account_id,
            account_balance=Decimal(0),
        )
        CRUDAccount.update_balance(db, account_id, transaction_in.timestamp)
        return transaction_out

    @classmethod
    def delete_transaction(
        cls, db: Session, movement_id: int, account_id: int, transaction_id: int
    ) -> int:
        transaction_out = cls.read_transaction(
            db, account_id, movement_id, transaction_id
        )
        CRUDMovement.delete_transaction(db, movement_id, transaction_id)
        Account.update_balance(db, account_id, transaction_out.timestamp)
        return transaction_id

    @classmethod
    def read_transaction(
        cls,
        db: Session,
        account_id: int | None,
        movement_id: int | None,
        transaction_id: int,
    ) -> TransactionApiOut:
        statement = Account.select_transactions(account_id, movement_id, transaction_id)
        transaction = Transaction.read_one_from_query(db, statement, transaction_id)
        return TransactionApiOut.from_orm(transaction)


class CRUDSyncableAccount(
    CRUDSyncedBase[
        Account,
        AccountPlaidOut,
        AccountPlaidIn,
    ]
):
    db_model = Account

    OUT_MODELS: dict[str, Type[AccountPlaidOut]] = {
        "credit": CreditPlaidOut,
        "depository": DepositoryPlaidOut,
        "loan": LoanPlaidOut,
    }

    @classmethod
    def create(
        cls, db: Session, obj_in: AccountPlaidIn, **kwargs: Any
    ) -> AccountPlaidOut:
        account = cls.db_model.from_schema(obj_in, **kwargs)
        account = cls.db_model.create(db, account)
        return cls.from_orm(account)

    @classmethod
    def read(cls, db: Session, id: int) -> AccountPlaidOut:
        account = cls.db_model.read(db, id)
        return cls.from_orm(account)

    @classmethod
    def read_many(
        cls,
        db: Session,
        offset: int,
        limit: int,
    ) -> Iterable[AccountPlaidOut]:
        for account in cls.db_model.read_many(db, offset, limit):
            yield cls.OUT_MODELS[account.type].from_orm(account)

    @classmethod
    def update(
        cls, db: Session, id: int, account_in: AccountPlaidIn, **kwargs: Any
    ) -> AccountPlaidOut:
        account = cls.db_model.update(db, id, **account_in.dict(), **kwargs)
        account = Account.update_balance(db, id)
        return cls.from_orm(account)

    @classmethod
    def read_by_plaid_id(cls, db: Session, id: str) -> AccountPlaidOut:
        account_out = cls.db_model.read_by_plaid_id(db, id)
        return cls.from_orm(account_out)

    @classmethod
    def from_orm(cls, account: Account) -> AccountPlaidOut:
        return cls.OUT_MODELS[account.type].from_orm(account)
