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
from typing import TYPE_CHECKING, Any, TypeVar

from sqlalchemy import ForeignKey, Select
from sqlalchemy.orm import Mapped, relationship, mapped_column, Session

from app.common.models import Base, SyncableBase
from app.features.movement import Movement
from app.features.transaction import Transaction
from app.features.transactiondeserialiser import TransactionDeserialiser

if TYPE_CHECKING:
    from app.features.institution import Institution
    from app.features.user import User
    from app.features.userinstitutionlink import UserInstitutionLink

ModelType = TypeVar("ModelType", bound=Base)


class Account(Base):
    __tablename__ = "account"

    currency_code: Mapped[str]
    initial_balance: Mapped[Decimal]
    name: Mapped[str]

    institutionalaccount_id: Mapped[int | None] = mapped_column(
        ForeignKey("institutionalaccount.id")
    )
    noninstitutionalaccount_id: Mapped[int | None] = mapped_column(
        ForeignKey("noninstitutionalaccount.id")
    )

    institutionalaccount: Mapped["InstitutionalAccount" | None] = relationship(
        back_populates="account",
        uselist=False,
        cascade="all, delete",
    )
    noninstitutionalaccount: Mapped["NonInstitutionalAccount" | None] = relationship(
        back_populates="account",
        uselist=False,
        cascade="all, delete",
    )

    transactions: Mapped[list[Transaction]] = relationship(
        back_populates="account", cascade="all, delete", lazy="dynamic"
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
        cls, statement: Select[tuple[ModelType]]
    ) -> Select[tuple[ModelType]]:
        statement = statement.outerjoin(NonInstitutionalAccount)
        statement = statement.outerjoin(InstitutionalAccount)
        return statement

    @classmethod
    def select_children(
        cls, account_id: int | None, statement: Select[tuple[ModelType]]
    ) -> Select[tuple[ModelType]]:
        statement = statement.join(cls)
        statement = cls.join_subclasses(statement)
        if account_id is not None:
            statement = statement.where(cls.id == account_id)
        return statement

    @classmethod
    def select_accounts(cls, account_id: int | None) -> Select[tuple["Account"]]:
        statement = cls.select()
        statement = cls.join_subclasses(statement)
        if account_id:
            statement = statement.where(cls.id == account_id)
        return statement

    @classmethod
    def select_transactions(
        cls,
        account_id: int | None,
        *,
        movement_id: int | None,
        transaction_id: int | None,
        **kwargs: Any,
    ) -> Select[tuple[Transaction]]:
        statement = Movement.select_transactions(
            movement_id, transaction_id=transaction_id, **kwargs
        )
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


class InstitutionalAccount(SyncableBase):
    __tablename__ = "institutionalaccount"

    class Type(str, Enum):
        INVESTMENT = "investment"
        CREDIT = "credit"
        DEPOSITORY = "depository"
        LOAN = "loan"
        BROKERAGE = "brokerage"
        OTHER = "other"

    type: Mapped[Type]
    mask: Mapped[str]

    userinstitutionlink_id: Mapped[int] = mapped_column(
        ForeignKey("userinstitutionlink.id")
    )

    userinstitutionlink: Mapped["UserInstitutionLink"] = relationship(
        back_populates="institutionalaccounts"
    )
    account: Mapped["Account"] = relationship(
        back_populates="institutionalaccount", uselist=False
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


class NonInstitutionalAccount(Base):
    __tablename__ = "noninstitutionalaccount"

    class Type(str, Enum):
        PERSONAL_LEDGER = "personal ledger"
        CASH = "cash"
        PROPERTY = "property"

    type: Mapped[Type]
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))

    user: Mapped["User"] = relationship(back_populates="noninstitutionalaccounts")
    account: Mapped["Account"] = relationship(
        back_populates="noninstitutionalaccount",
        uselist=False,
    )
