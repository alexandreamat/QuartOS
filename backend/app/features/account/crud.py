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
from datetime import date
from decimal import Decimal
from typing import Any, Iterable, Type

from sqlalchemy.orm import Session

from app.common.crud import CRUDBase, CRUDSyncedBase
from app.common.exceptions import ObjectNotFoundError
from app.common.schemas import CurrencyCode
from app.features.exchangerate import get_exchange_rate
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
from app.features.transactiondeserialiser import (
    TransactionDeserialiserApiOut,
    TransactionDeserialiser,
)
from .models import Account
from .schemas import (
    AccountApiOut,
    AccountApiIn,
    AccountPlaidIn,
    AccountPlaidOut,
    CashApiOut,
    CreditApiOut,
    CreditPlaidOut,
    DepositoryApiOut,
    DepositoryPlaidOut,
    LoanApiOut,
    LoanPlaidOut,
    PersonalLedgerApiOut,
    PropertyApiOut,
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
    def model_validate(cls, account: Account) -> AccountApiOut:
        return cls.OUT_MODELS[account.type].model_validate(account)

    @classmethod
    def read_transaction_deserialiser(
        cls, db: Session, id: int
    ) -> TransactionDeserialiserApiOut:
        deserialiser = Account.read(db, id)
        if not deserialiser:
            raise ObjectNotFoundError(str(TransactionDeserialiser.__tablename__), 0)
        return TransactionDeserialiserApiOut.model_validate(deserialiser)

    @classmethod
    def is_synced(cls, db: Session, id: int) -> bool:
        return Account.read(db, id).is_synced

    @classmethod
    def update(
        cls, db: Session, id: int, obj_in: AccountApiIn, **kwargs: Any
    ) -> AccountApiOut:
        account_out = super().update(db, id, obj_in, **kwargs)
        cls.update_balance(db, id)
        return account_out

    @classmethod
    def update_balance(
        cls,
        db: Session,
        id: int,
        timestamp: date | None = None,
    ) -> AccountApiOut:
        account_out = Account.update_balance(db, id, timestamp)
        return cls.model_validate(account_out)

    @classmethod
    def create_many_movements(
        cls,
        db: Session,
        account_id: int,
        transactions: list[TransactionApiIn],
        transaction_ids: list[int],
        default_currency_code: CurrencyCode,
    ) -> Iterable[MovementApiOut]:
        min_timestamp = None
        account_out = CRUDAccount.read(db, account_id)
        for transaction_in in transactions:
            if min_timestamp:
                min_timestamp = min(transaction_in.timestamp, min_timestamp)
            else:
                min_timestamp = transaction_in.timestamp
            yield CRUDMovement.create(
                db,
                [transaction_in],
                transaction__account_id=account_id,
                transaction__account_balance=Decimal(0),
                transaction__exchange_rate=get_exchange_rate(
                    account_out.currency_code,
                    default_currency_code,
                    transaction_in.timestamp,
                ),
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
        default_currency_code: CurrencyCode,
    ) -> MovementApiOut:
        account_out = CRUDAccount.read(db, account_id)
        movement_out = CRUDMovement.create_plaid(
            db,
            transaction_in,
            account_id=account_id,
            account_balance=Decimal(0),
            exchange_rate=get_exchange_rate(
                account_out.currency_code,
                default_currency_code,
                transaction_in.timestamp,
            ),
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
        default_currency_code: CurrencyCode,
    ) -> TransactionApiOut:
        account_out = CRUDAccount.read(db, account_id)
        transaction_out = CRUDMovement.create_transaction(
            db,
            movement_id,
            transaction_in,
            account_id=account_id,
            account_balance=Decimal(0),
            exchange_rate=get_exchange_rate(
                account_out.currency_code,
                default_currency_code,
                transaction_in.timestamp,
            ),
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
        default_currency_code: CurrencyCode,
    ) -> TransactionApiOut:
        cls.read_transaction(db, account_id, movement_id, transaction_id)
        account_out = CRUDAccount.read(db, account_id)
        transaction_out = CRUDMovement.update_transaction(
            db,
            movement_id,
            transaction_id,
            transaction_in,
            new_movement_id,
            account_id=account_id,
            account_balance=Decimal(0),
            exchange_rate=get_exchange_rate(
                account_out.currency_code,
                default_currency_code,
                transaction_in.timestamp,
            ),
        )
        CRUDAccount.update_balance(db, account_id, transaction_in.timestamp)
        return transaction_out

    @classmethod
    def update_transactions_amount_default_currency(
        cls, db: Session, account_id: int, default_currency_code: CurrencyCode
    ) -> None:
        account = Account.read(db, account_id)
        for transaction in account.transactions:
            transaction.exchange_rate = get_exchange_rate(
                account.currency_code, default_currency_code, transaction.timestamp
            )

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
        statement = Account.select_transactions(
            account_id, movement_id=movement_id, transaction_id=transaction_id
        )
        transaction = Transaction.read_one_from_query(db, statement, transaction_id)
        return TransactionApiOut.model_validate(transaction)


class CRUDSyncableAccount(CRUDSyncedBase[Account, AccountPlaidOut, AccountPlaidIn]):
    db_model = Account

    OUT_MODELS: dict[str, Type[AccountPlaidOut]] = {
        "credit": CreditPlaidOut,
        "depository": DepositoryPlaidOut,
        "loan": LoanPlaidOut,
    }

    @classmethod
    def model_validate(cls, account: Account) -> AccountPlaidOut:
        return cls.OUT_MODELS[account.type].model_validate(account)

    @classmethod
    def update(
        cls, db: Session, id: int, obj_in: AccountPlaidIn, **kwargs: Any
    ) -> AccountPlaidOut:
        super().update(db, id, obj_in, **kwargs)
        account = Account.update_balance(db, id)
        return cls.model_validate(account)
