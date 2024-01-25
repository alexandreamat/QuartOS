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
from typing import Any, Iterable

from sqlmodel import Session

from app.common.crud import CRUDBase, CRUDSyncedBase
from app.common.exceptions import ObjectNotFoundError
from app.common.models import CurrencyCode
from app.features.account.models import AccountApiIn, AccountApiOut
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

    class CRUDInstitutionalAccount(
        CRUDBase[
            Account.InstitutionalAccount,
            AccountApiOut.InstitutionalAccount,
            AccountApiIn.InstitutionalAccount,
        ]
    ):
        db_model = Account.InstitutionalAccount
        out_model = AccountApiOut.InstitutionalAccount

    class CRUDNonInstitutionalAccount(
        CRUDBase[
            Account.NonInstitutionalAccount,
            AccountApiOut.NonInstitutionalAccount,
            AccountApiIn.NonInstitutionalAccount,
        ]
    ):
        db_model = Account.NonInstitutionalAccount
        out_model = AccountApiOut.NonInstitutionalAccount

    @classmethod
    def create(
        cls,
        db: Session,
        obj_in: AccountApiIn,
        userinstitutionlink_id: int | None = None,
        user_id: int | None = None,
        **kwargs: Any
    ) -> AccountApiOut:
        account_in = obj_in
        account_kw = account_in.model_dump(
            exclude={"institutionalaccount", "noninstitutionalaccount"}
        )
        if account_in.institutionalaccount:
            institutionalaccount = Account.InstitutionalAccount(
                userinstitutionlink_id=userinstitutionlink_id,
                **account_in.institutionalaccount.model_dump(),
            )
            account = Account.create(
                db,
                institutionalaccount=institutionalaccount,
                **account_kw,
                **kwargs,
            )
        elif account_in.noninstitutionalaccount:
            noninstitutionalaccount = Account.NonInstitutionalAccount(
                user_id=user_id,
                **account_in.noninstitutionalaccount.model_dump(),
            )
            account = Account.create(
                db,
                noninstitutionalaccount=noninstitutionalaccount,
                **account_kw,
                **kwargs,
            )
        else:
            raise ValueError
        return AccountApiOut.model_validate(account)

    @classmethod
    def read_transaction_deserialiser(
        cls, db: Session, id: int
    ) -> TransactionDeserialiserApiOut:
        deserialiser = Account.read(db, id).transactiondeserialiser
        if not deserialiser:
            raise ObjectNotFoundError(str(TransactionDeserialiser.__tablename__), 0)
        return TransactionDeserialiserApiOut.model_validate(deserialiser)

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
                institutionalaccount_out = cls.CRUDInstitutionalAccount.update(
                    db,
                    account_out.institutionalaccount_id,
                    account_in.institutionalaccount,
                    userinstitutionlink_id=userinstitutionlink_id,
                )
            elif (
                account_out.noninstitutionalaccount
                and account_out.noninstitutionalaccount_id
            ):
                cls.CRUDNonInstitutionalAccount.delete(
                    db, account_out.noninstitutionalaccount_id
                )
                institutionalaccount_out = cls.CRUDInstitutionalAccount.create(
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
                noninstitutionalaccount_out = cls.CRUDNonInstitutionalAccount.update(
                    db,
                    account_out.noninstitutionalaccount_id,
                    account_in.noninstitutionalaccount,
                    user_id=user_id,
                )
            elif (
                account_out.institutionalaccount and account_out.institutionalaccount_id
            ):
                cls.CRUDInstitutionalAccount.delete(
                    db,
                    account_out.institutionalaccount_id,
                )
                noninstitutionalaccount_out = cls.CRUDNonInstitutionalAccount.create(
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
            noninstitutionalaccount_id=noninstitutionalaccount_id,
        )
        cls.update_balance(db, id)
        return AccountApiOut.model_validate(account)

    @classmethod
    def update_balance(
        cls,
        db: Session,
        id: int,
        timestamp: date | None = None,
    ) -> AccountApiOut:
        account_out = Account.update_balance(db, id, timestamp)
        return AccountApiOut.model_validate(account_out)

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


class CRUDSyncableAccount:
    class CRUDInstitutionalAccount(
        CRUDSyncedBase[
            Account.InstitutionalAccount,
            AccountPlaidOut.InstitutionalAccount,
            AccountPlaidIn.InstitutionalAccount,
        ]
    ):
        db_model = Account.InstitutionalAccount
        out_model = AccountPlaidOut.InstitutionalAccount

    @classmethod
    def read_by_plaid_id(cls, db: Session, id: str) -> AccountPlaidOut:
        institutionalaccount = Account.InstitutionalAccount.read_by_plaid_id(db, id)
        account = institutionalaccount.account
        return AccountPlaidOut.model_validate(account)

    @classmethod
    def create(
        cls, db: Session, account_in: AccountPlaidIn, **kwargs: Any
    ) -> AccountPlaidOut:
        institutionalaccount_out = cls.CRUDInstitutionalAccount.create(
            db, account_in.institutionalaccount, **kwargs
        )
        account = Account.create(
            db,
            **account_in.model_dump(exclude={"institutionalaccount"}),
            institutionalaccount_id=institutionalaccount_out.id,
        )
        return AccountPlaidOut.model_validate(account)

    @classmethod
    def update(
        cls, db: Session, account_id: int, account_in: AccountPlaidIn, **kwargs: Any
    ) -> AccountPlaidOut:
        account = Account.read(db, account_id)
        assert account.institutionalaccount_id
        institutionalaccount_out = cls.CRUDInstitutionalAccount.update(
            db,
            account.institutionalaccount_id,
            account_in.institutionalaccount,
            **kwargs,
        )
        account = Account.update(
            db,
            account_id,
            **account_in.model_dump(exclude={"institutionalaccount"}),
            institutionalaccount_id=institutionalaccount_out.id,
        )
        account = Account.update_balance(db, account_id)
        return AccountPlaidOut.model_validate(account)
