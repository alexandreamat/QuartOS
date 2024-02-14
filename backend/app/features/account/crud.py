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
from datetime import date
from decimal import Decimal
from typing import Any, Iterable, Type

from sqlalchemy.orm import Session

from app.common.crud import CRUDBase, CRUDSyncedBase
from app.common.exceptions import ObjectNotFoundError
from app.common.schemas import CurrencyCode
from app.features.account.schemas import (
    BrokeragePlaidIn,
    BrokeragePlaidOut,
    CashApiIn,
    CreditApiIn,
    DepositoryApiIn,
    InvestmentPlaidIn,
    InvestmentPlaidOut,
    LoanApiIn,
    PersonalLedgerApiIn,
    PropertyApiIn,
)
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
from app.features.transaction.crud import CRUDSyncableTransaction, CRUDTransaction
from app.features.transactiondeserialiser import (
    TransactionDeserialiserApiOut,
    TransactionDeserialiser,
)
from .models import Account, Cash, Credit, Depository, Loan, PersonalLedger, Property
from .schemas import (
    AccountApiOut,
    AccountApiIn,
    AccountPlaidIn,
    AccountPlaidOut,
    CashApiOut,
    CreditApiOut,
    CreditPlaidIn,
    CreditPlaidOut,
    DepositoryApiOut,
    DepositoryPlaidIn,
    DepositoryPlaidOut,
    LoanApiOut,
    LoanPlaidIn,
    LoanPlaidOut,
    PersonalLedgerApiOut,
    PropertyApiOut,
)

logger = logging.getLogger(__name__)


class CRUDAccount(CRUDBase[Account, AccountApiOut, AccountApiIn]):
    db_model = Account

    OUT_MODELS: dict[Type[Account], Type[AccountApiOut]] = {
        Cash: CashApiOut,
        Credit: CreditApiOut,
        Depository: DepositoryApiOut,
        Loan: LoanApiOut,
        PersonalLedger: PersonalLedgerApiOut,
        Property: PropertyApiOut,
    }
    IN_MODELS: dict[Type[AccountApiIn], Type[Account]] = {
        CashApiIn: Cash,
        CreditApiIn: Credit,
        DepositoryApiIn: Depository,
        LoanApiIn: Loan,
        PersonalLedgerApiIn: PersonalLedger,
        PropertyApiIn: Property,
    }

    @classmethod
    def model_validate(cls, account: Account) -> AccountApiOut:
        return cls.OUT_MODELS[type(account)].model_validate(account)

    @classmethod
    def create(cls, db: Session, obj_in: AccountApiIn, **kwargs: Any) -> AccountApiOut:
        obj = cls.IN_MODELS[type(obj_in)].create(db, **obj_in.model_dump(), **kwargs)
        return cls.model_validate(obj)

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
    def create_many_transactions(
        cls,
        db: Session,
        account_id: int,
        transactions: list[TransactionApiIn],
        default_currency_code: CurrencyCode,
    ) -> Iterable[TransactionApiOut]:
        min_timestamp = None
        account_out = CRUDAccount.read(db, account_id)
        for transaction_in in transactions:
            if min_timestamp:
                min_timestamp = min(transaction_in.timestamp, min_timestamp)
            else:
                min_timestamp = transaction_in.timestamp
            yield CRUDTransaction.create(
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
        CRUDAccount.update_balance(db, account_id, min_timestamp)

    @classmethod
    def create_transaction_plaid(
        cls,
        db: Session,
        account_id: int,
        transaction_in: TransactionPlaidIn,
        default_currency_code: CurrencyCode,
    ) -> TransactionApiOut:
        account_out = CRUDAccount.read(db, account_id)
        transaction_out = CRUDSyncableTransaction.create(
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
        return transaction_out

    @classmethod
    def create_transaction(
        cls,
        db: Session,
        account_id: int,
        transaction_in: TransactionApiIn,
        default_currency_code: CurrencyCode,
        movement_id: int | None = None,
    ) -> TransactionApiOut:
        account_out = CRUDAccount.read(db, account_id)
        transaction_out = CRUDTransaction.create(
            db,
            transaction_in,
            movement_id=movement_id,
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
        transaction_id: int,
        transaction_in: TransactionApiIn,
        default_currency_code: CurrencyCode,
        movement_id: int | None = None,
    ) -> TransactionApiOut:
        account_out = CRUDAccount.read(db, account_id)
        transaction_out = CRUDTransaction.update(
            db,
            transaction_id,
            transaction_in,
            account_id=account_id,
            account_balance=Decimal(0),
            exchange_rate=get_exchange_rate(
                account_out.currency_code,
                default_currency_code,
                transaction_in.timestamp,
            ),
            movement_id=movement_id,
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
        cls, db: Session, account_id: int, transaction_id: int
    ) -> int:
        transaction_out = CRUDTransaction.read(db, transaction_id)
        CRUDTransaction.delete(db, transaction_id)
        Account.update_balance(db, account_id, transaction_out.timestamp)
        return transaction_id


class CRUDSyncableAccount(CRUDSyncedBase[Account, AccountPlaidOut, AccountPlaidIn]):
    db_model = Account

    OUT_MODELS: dict[Type[Account], Type[AccountPlaidOut]] = {
        Credit: CreditPlaidOut,
        Depository: DepositoryPlaidOut,
        Loan: LoanPlaidOut,
    }
    IN_MODELS: dict[Type[AccountPlaidIn], Type[Account]] = {
        CreditPlaidIn: Credit,
        DepositoryPlaidIn: Depository,
        LoanPlaidIn: Loan,
    }

    @classmethod
    def model_validate(cls, account: Account) -> AccountPlaidOut:
        return cls.OUT_MODELS[type(account)].model_validate(account)

    @classmethod
    def create(
        cls, db: Session, obj_in: AccountPlaidIn, **kwargs: Any
    ) -> AccountPlaidOut:
        obj = cls.IN_MODELS[type(obj_in)].create(db, **obj_in.model_dump(), **kwargs)
        return cls.model_validate(obj)

    @classmethod
    def update(
        cls, db: Session, id: int, obj_in: AccountPlaidIn, **kwargs: Any
    ) -> AccountPlaidOut:
        super().update(db, id, obj_in, **kwargs)
        account = Account.update_balance(db, id)
        return cls.model_validate(account)
