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
from enum import Enum
from typing import TYPE_CHECKING, Any

from sqlmodel import Field, Relationship, SQLModel, Session
from sqlmodel.sql.expression import SelectOfScalar

from app.common.models import (
    Base,
    CurrencyCode,
    SyncedMixin,
    SyncableBase,
    SyncedBase,
    BaseType,
)
from app.features.movement import Movement
from app.features.transaction import Transaction
from app.features.transactiondeserialiser import TransactionDeserialiser

if TYPE_CHECKING:
    from app.features.institution import Institution
    from app.features.user import User
    from app.features.userinstitutionlink import UserInstitutionLink


class _AccountBase(SQLModel):
    class InstitutionalAccount(SQLModel):
        class InstitutionalAccountType(str, Enum):
            INVESTMENT = "investment"
            CREDIT = "credit"
            DEPOSITORY = "depository"
            LOAN = "loan"
            BROKERAGE = "brokerage"
            OTHER = "other"

        type: InstitutionalAccountType
        mask: str

    class NonInstitutionalAccount(SQLModel):
        class NonInstitutionalAccountType(str, Enum):
            PERSONAL_LEDGER = "personal ledger"
            CASH = "cash"
            PROPERTY = "property"

        type: NonInstitutionalAccountType

    currency_code: CurrencyCode
    initial_balance: Decimal
    name: str


class AccountApiIn(_AccountBase):
    class InstitutionalAccount(_AccountBase.InstitutionalAccount):
        ...

    class NonInstitutionalAccount(_AccountBase.NonInstitutionalAccount):
        ...

    institutionalaccount: InstitutionalAccount | None = None
    noninstitutionalaccount: NonInstitutionalAccount | None = None


class AccountApiOut(_AccountBase, Base):
    class InstitutionalAccount(_AccountBase.InstitutionalAccount, Base):
        userinstitutionlink_id: int

    class NonInstitutionalAccount(_AccountBase.NonInstitutionalAccount, Base):
        user_id: int

    institutionalaccount: InstitutionalAccount | None
    noninstitutionalaccount: NonInstitutionalAccount | None
    is_synced: bool
    balance: Decimal


class AccountPlaidIn(_AccountBase):
    class InstitutionalAccount(_AccountBase.InstitutionalAccount, SyncedMixin):
        ...

    institutionalaccount: InstitutionalAccount


class AccountPlaidOut(_AccountBase, Base):
    class InstitutionalAccount(_AccountBase.InstitutionalAccount, SyncedBase):
        ...

    institutionalaccount: InstitutionalAccount


class Account(_AccountBase, Base, table=True):
    class InstitutionalAccount(
        _AccountBase.InstitutionalAccount, SyncableBase, table=True
    ):
        userinstitutionlink_id: int = Field(foreign_key="userinstitutionlink.id")

        userinstitutionlink: "UserInstitutionLink" = Relationship(
            back_populates="institutionalaccounts"
        )
        account: "Account" = Relationship(
            back_populates="institutionalaccount",
            sa_relationship_kwargs={"uselist": False},
        )

        @property
        def user(self) -> "User":
            return self.userinstitutionlink.user

        @property
        def institution(self) -> "Institution":
            return self.userinstitutionlink.institution

        @property
        def transactiondeserialiser(self) -> TransactionDeserialiser | None:
            return self.userinstitutionlink.institution.transactiondeserialiser

        @property
        def is_synced(self) -> bool:
            return True if self.plaid_id else False

    class NonInstitutionalAccount(
        _AccountBase.NonInstitutionalAccount, Base, table=True
    ):
        user_id: int = Field(foreign_key="user.id")
        user: "User" = Relationship(back_populates="noninstitutionalaccounts")
        account: "Account" = Relationship(
            back_populates="noninstitutionalaccount",
            sa_relationship_kwargs={"uselist": False},
        )

    institutionalaccount_id: int | None = Field(foreign_key="institutionalaccount.id")
    noninstitutionalaccount_id: int | None = Field(
        foreign_key="noninstitutionalaccount.id"
    )

    institutionalaccount: InstitutionalAccount | None = Relationship(
        back_populates="account",
        sa_relationship_kwargs={"uselist": False, "cascade": "all, delete"},
    )
    noninstitutionalaccount: NonInstitutionalAccount | None = Relationship(
        back_populates="account",
        sa_relationship_kwargs={"uselist": False, "cascade": "all, delete"},
    )

    transactions: list[Transaction] = Relationship(
        back_populates="account",
        sa_relationship_kwargs={
            "cascade": "all, delete",
            "lazy": "dynamic",
        },
    )

    @classmethod
    def update_balance(
        cls, db: Session, id: int, timestamp: date | None = None
    ) -> "Account":
        account = Account.read(db, id)
        transactions_query: Query = account.transactions  # type: ignore

        if timestamp:
            prev_transaction: Transaction = (
                transactions_query.where(Transaction.timestamp < timestamp)
                .order_by(*Transaction.get_timestamp_desc_clauses())
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
            *Transaction.get_timestamp_asc_clauses()
        ).yield_per(100)

        for result in transactions_query:
            transaction: Transaction = result
            account_balance = prev_balance + transaction.amount
            Transaction.update(db, transaction.id, account_balance=account_balance)
            prev_balance = transaction.account_balance

        return cls.read(db, id)

    @classmethod
    def join_subclasses(
        cls, statement: SelectOfScalar[BaseType]
    ) -> SelectOfScalar[BaseType]:
        # fmt: off
        return ( 
            statement
            .outerjoin(cls.NonInstitutionalAccount)
            .outerjoin(cls.InstitutionalAccount)
        )
        # fmt: on

    @classmethod
    def select_children(
        cls, account_id: int | None, statement: SelectOfScalar[BaseType]
    ) -> SelectOfScalar[BaseType]:
        statement = statement.join(cls)
        statement = cls.join_subclasses(statement)
        if account_id is not None:
            statement = statement.where(cls.id == account_id)
        return statement

    @classmethod
    def select_accounts(cls, account_id: int | None) -> SelectOfScalar["Account"]:
        statement = cls.select()
        statement = cls.join_subclasses(statement)
        if account_id:
            statement = statement.where(cls.id == account_id)
        return statement

    @classmethod
    def select_movements(
        cls,
        account_id: int | None,
        movement_id: int | None,
        **kwargs: Any,
    ) -> SelectOfScalar[Movement]:
        statement = Movement.select_movements(movement_id, **kwargs)
        statement = statement.join(Transaction)
        statement = cls.select_children(account_id, statement)
        return statement

    @classmethod
    def select_transactions(
        cls,
        account_id: int | None,
        movement_id: int | None,
        transaction_id: int | None,
        **kwargs: Any,
    ) -> SelectOfScalar[Transaction]:
        statement = Movement.select_transactions(movement_id, transaction_id, **kwargs)
        statement = cls.select_children(account_id, statement)
        return statement

    @property
    def user(self) -> "User":
        if self.institutionalaccount:
            return self.institutionalaccount.userinstitutionlink.user
        if self.noninstitutionalaccount:
            return self.noninstitutionalaccount.user
        raise ValueError

    @property
    def transactiondeserialiser(self) -> TransactionDeserialiser | None:
        if self.institutionalaccount:
            return self.institutionalaccount.transactiondeserialiser
        return None

    @property
    def institution(self) -> "Institution | None":
        if self.institutionalaccount:
            return self.institutionalaccount.institution
        return None

    @property
    def userinstitutionlink(self) -> "UserInstitutionLink | None":
        if self.institutionalaccount:
            return self.institutionalaccount.userinstitutionlink
        return None

    @property
    def is_synced(self) -> bool:
        if self.institutionalaccount:
            return self.institutionalaccount.is_synced
        return False

    @property
    def balance(self) -> Decimal:
        query = self.transactions
        first_transaction: Transaction | None = query.order_by(  # type: ignore
            *Transaction.get_timestamp_desc_clauses()
        ).first()
        if not first_transaction:
            return self.initial_balance
        return first_transaction.account_balance
