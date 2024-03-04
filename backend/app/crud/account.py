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
from typing import Any, Generic, Iterable, Type

from sqlalchemy import Select
from sqlalchemy.orm import Session

from app.crud.common import (
    CRUDBase,
    InSchemaT,
    OutSchemaT,
)
from app.crud.transaction import CRUDSyncableTransaction, CRUDTransaction
from app.models.account import (
    Account,
    Cash,
    Credit,
    Depository,
    InstitutionalAccount,
    Loan,
    NonInstitutionalAccount,
    PersonalLedger,
    Property,
)
from app.models.transactiondeserialiser import TransactionDeserialiser
from app.models.userinstitutionlink import UserInstitutionLink
from app.schemas.account import (
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
from app.schemas.account import (
    CashApiIn,
    CreditApiIn,
    DepositoryApiIn,
    LoanApiIn,
    PersonalLedgerApiIn,
    PropertyApiIn,
)
from app.schemas.common import ApiInMixin, ApiOutMixin, CurrencyCode
from app.schemas.transaction import (
    TransactionApiIn,
    TransactionApiOut,
    TransactionPlaidIn,
)
from app.utils.exchangerate import get_exchange_rate

logger = logging.getLogger(__name__)


class __CRUDAccountBase(
    Generic[OutSchemaT, InSchemaT], CRUDBase[Account, OutSchemaT, InSchemaT]
):
    __model__ = Account
    __out_schemas__: dict[Type[Account], Type[OutSchemaT]]
    __in_schemas__: dict[Type[InSchemaT], Type[Account]]

    @classmethod
    def select(
        cls,
        *,
        user_id: int | None = None,
        user_institution_link_id: int | None = None,
        **kwargs: Any,
    ) -> Select[tuple[Account]]:
        statement = super().select(**kwargs)
        if user_id:
            statement = statement.outerjoin(UserInstitutionLink)
            statement = statement.where(
                (NonInstitutionalAccount.user_id == user_id)
                | (UserInstitutionLink.user_id == user_id)
            )
        if user_institution_link_id:
            statement = statement.where(
                InstitutionalAccount.user_institution_link_id
                == user_institution_link_id
            )

        return statement

    @classmethod
    def model_validate(cls, account: Account) -> OutSchemaT:
        return cls.__out_schemas__[type(account)].model_validate(account)

    @classmethod
    def create(cls, db: Session, obj_in: InSchemaT, **kwargs: Any) -> OutSchemaT:
        obj = cls.__in_schemas__[type(obj_in)].create(
            db, **obj_in.model_dump(), **kwargs
        )
        return cls.model_validate(obj)

    @classmethod
    def update(
        cls, db: Session, id: int, obj_in: InSchemaT, **kwargs: Any
    ) -> OutSchemaT:
        account_out = super().update(db, id, obj_in, **kwargs)
        cls.update_balance(db, id)
        return account_out

    @classmethod
    def update_balance(
        cls,
        db: Session,
        id: int,
        timestamp: date | None = None,
    ) -> OutSchemaT:
        CRUDTransaction.update_account_balances(db, id, timestamp)
        return cls.read(db, id__eq=id)

    @classmethod
    def create_many_transactions(
        cls,
        db: Session,
        account_id: int,
        transactions: list[TransactionApiIn],
        default_currency_code: CurrencyCode,
    ) -> Iterable[TransactionApiOut]:
        min_timestamp = None
        account_out = CRUDAccount.read(db, id=account_id)
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
        account_out = CRUDAccount.read(db, id=account_id)
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
        transaction_group_id: int | None = None,
    ) -> TransactionApiOut:
        account_out = CRUDAccount.read(db, id=account_id)
        transaction_out = CRUDTransaction.create(
            db,
            transaction_in,
            transaction_group_id=transaction_group_id,
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
        transaction_group_id: int | None = None,
    ) -> TransactionApiOut:
        account_out = CRUDAccount.read(db, id=account_id)
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
            transaction_group_id=transaction_group_id,
        )
        CRUDAccount.update_balance(db, account_id, transaction_in.timestamp)
        return transaction_out

    @classmethod
    def update_transactions_amount_default_currency(
        cls, db: Session, account_id: int, default_currency_code: CurrencyCode
    ) -> None:
        account = Account.read(db, id__eq=account_id)
        for transaction in account.transactions:
            transaction.exchange_rate = get_exchange_rate(
                account.currency_code, default_currency_code, transaction.timestamp
            )


class CRUDAccount(__CRUDAccountBase[AccountApiOut, AccountApiIn]):
    __out_schemas__: dict[Type[Account], Type[AccountApiOut]] = {
        Cash: CashApiOut,
        Credit: CreditApiOut,
        Depository: DepositoryApiOut,
        Loan: LoanApiOut,
        PersonalLedger: PersonalLedgerApiOut,
        Property: PropertyApiOut,
    }
    __in_schemas__: dict[Type[AccountApiIn], Type[Account]] = {
        CashApiIn: Cash,
        CreditApiIn: Credit,
        DepositoryApiIn: Depository,
        LoanApiIn: Loan,
        PersonalLedgerApiIn: PersonalLedger,
        PropertyApiIn: Property,
    }


class CRUDSyncableAccount(__CRUDAccountBase[AccountPlaidOut, AccountPlaidIn]):
    __out_schemas__: dict[Type[Account], Type[AccountPlaidOut]] = {
        Credit: CreditPlaidOut,
        Depository: DepositoryPlaidOut,
        Loan: LoanPlaidOut,
    }
    __in_schemas__: dict[Type[AccountPlaidIn], Type[Account]] = {
        CreditPlaidIn: Credit,
        DepositoryPlaidIn: Depository,
        LoanPlaidIn: Loan,
    }
