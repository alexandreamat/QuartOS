from typing import Any, Iterable

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
)

from .models import (
    Account,
    AccountApiOut,
    AccountApiIn,
    AccountPlaidIn,
    AccountPlaidOut,
)


class CRUDInstitutionalAccount(
    CRUDBase[
        Account.InstitutionalAccount,
        AccountApiOut.InstitutionalAccount,
        AccountApiIn.InstitutionalAccount,
    ]
):
    db_model = Account.InstitutionalAccount
    out_model = AccountApiOut.InstitutionalAccount


class CRUDSyncableInstitutionalAccount(
    CRUDSyncedBase[
        Account.InstitutionalAccount,
        AccountPlaidOut.InstitutionalAccount,
        AccountPlaidIn.InstitutionalAccount,
    ]
):
    db_model = Account.InstitutionalAccount
    out_model = AccountPlaidOut.InstitutionalAccount


class CRUDNonInstitutionalAccount(
    CRUDBase[
        Account.NonInstitutionalAccount,
        AccountApiOut.NonInstitutionalAccount,
        AccountApiIn.NonInstitutionalAccount,
    ]
):
    db_model = Account.NonInstitutionalAccount
    out_model = AccountApiOut.NonInstitutionalAccount


class CRUDAccount(CRUDBase[Account, AccountApiOut, AccountApiIn]):
    db_model = Account
    out_model = AccountApiOut

    @classmethod
    def read_transaction_deserialiser(
        cls, db: Session, id: int
    ) -> TransactionDeserialiserApiOut:
        deserialiser = Account.read(db, id).transactiondeserialiser
        if not deserialiser:
            raise ObjectNotFoundError(str(TransactionDeserialiser.__tablename__))
        return TransactionDeserialiserApiOut.from_orm(deserialiser)

    @classmethod
    def sync(
        cls, db: Session, account_in: AccountPlaidIn, **kwargs: Any
    ) -> AccountPlaidOut:
        institutionalaccount_out = CRUDSyncableInstitutionalAccount.create(
            db, account_in.institutionalaccount, **kwargs
        )
        db_account_in = Account(
            **account_in.dict(exclude={"institutionalaccount"}),
            institutionalaccount_id=institutionalaccount_out.id
        )
        db_account_out = Account.create(db, db_account_in)
        return AccountPlaidOut.from_orm(db_account_out)

    @classmethod
    def is_synced(cls, db: Session, id: int) -> bool:
        return Account.read(db, id).is_synced

    @classmethod
    def update(
        cls,
        db: Session,
        id: int,
        account_in: AccountApiIn,
        userinstitutionlink_id: int | None = None,
        user_id: int | None = None,
    ) -> AccountApiOut:
        account_out = Account.read(db, id)
        if account_in.institutionalaccount and userinstitutionlink_id:
            if account_out.institutionalaccount and account_out.institutionalaccount_id:
                institutionalaccount_out = CRUDInstitutionalAccount.update(
                    db,
                    account_out.institutionalaccount_id,
                    account_in.institutionalaccount,
                    userinstitutionlink_id=userinstitutionlink_id,
                )
            elif (
                account_out.noninstitutionalaccount
                and account_out.noninstitutionalaccount_id
            ):
                CRUDNonInstitutionalAccount.delete(
                    db, account_out.noninstitutionalaccount_id
                )
                institutionalaccount_out = CRUDInstitutionalAccount.create(
                    db,
                    account_in.institutionalaccount,
                    userinstitutionlink_id=userinstitutionlink_id,
                )
            else:
                raise ValueError
            institutionalaccount_id = institutionalaccount_out.id
            noninstitutionalaccount_id = None
        elif account_in.noninstitutionalaccount and user_id:
            if (
                account_out.noninstitutionalaccount
                and account_out.noninstitutionalaccount_id
            ):
                noninstitutionalaccount_out = CRUDNonInstitutionalAccount.update(
                    db,
                    account_out.noninstitutionalaccount_id,
                    account_in.noninstitutionalaccount,
                    user_id=user_id,
                )
            elif (
                account_out.institutionalaccount and account_out.institutionalaccount_id
            ):
                CRUDInstitutionalAccount.delete(
                    db,
                    account_out.institutionalaccount_id,
                )
                noninstitutionalaccount_out = CRUDNonInstitutionalAccount.create(
                    db,
                    account_in.noninstitutionalaccount,
                    user_id=user_id,
                )
            else:
                raise ValueError
            institutionalaccount_id = None
            noninstitutionalaccount_id = noninstitutionalaccount_out.id
        else:
            raise ValueError
        dict_in = account_in.dict(
            exclude={"institutionalaccount", "noninstitutionalaccount"}
        )
        account = Account.update(
            db,
            id,
            **dict_in,
            institutionalaccount_id=institutionalaccount_id,
            noninstitutionalaccount_id=noninstitutionalaccount_id
        )
        cls.update_balance(db, id)
        return AccountApiOut.from_orm(account)

    @classmethod
    def update_balance(
        cls,
        db: Session,
        id: int,
        timestamp: date | None = None,
    ) -> AccountApiOut:
        account_out = Account.update_balance(db, id, timestamp)
        return AccountApiOut.from_orm(account_out)

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
            min_timestamp = (
                min(transaction_in.timestamp, min_timestamp)
                if min_timestamp
                else transaction_in.timestamp
            )
            yield CRUDMovement.create(
                db, transaction_in, account_id=account_id, account_balance=Decimal(0)
            )
        for transaction_id in transaction_ids:
            transaction_out = cls.read_transaction(db, account_id, None, transaction_id)
            min_timestamp = (
                min(transaction_out.timestamp, min_timestamp)
                if min_timestamp
                else transaction_out.timestamp
            )
            yield CRUDMovement.create(db, transaction_id)
        CRUDAccount.update_balance(db, account_id, min_timestamp)

    @classmethod
    def create_movement(
        cls,
        db: Session,
        account_id: int,
        transaction: TransactionApiIn | int,
    ) -> MovementApiOut:
        if isinstance(transaction, TransactionApiIn):
            transaction_in = transaction
            timestamp = transaction_in.timestamp
            movement_out = CRUDMovement.create(
                db, transaction_in, account_id=account_id, account_balance=Decimal(0)
            )

        else:
            transaction_id = transaction
            transaction_out = cls.read_transaction(db, account_id, None, transaction_id)
            timestamp = transaction_out.timestamp
            movement_out = CRUDMovement.create(
                db,
                transaction_id,
            )

        CRUDAccount.update_balance(db, account_id, timestamp)
        return movement_out

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
    ) -> None:
        transaction_out = cls.read_transaction(
            db, account_id, movement_id, transaction_id
        )
        CRUDMovement.delete_transaction(db, movement_id, transaction_id)
        Account.update_balance(db, account_id, transaction_out.timestamp)

    @classmethod
    def read_transaction(
        cls,
        db: Session,
        account_id: int | None,
        movement_id: int | None,
        transaction_id: int,
    ) -> TransactionApiOut:
        statement = Account.select_transactions(account_id, movement_id, transaction_id)
        transaction = db.exec(statement).one()
        return TransactionApiOut.from_orm(transaction)
