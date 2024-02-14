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
from typing import TYPE_CHECKING, Any, TypeVar

from sqlalchemy import ForeignKey, Select
from sqlalchemy.orm import Mapped, relationship, mapped_column, Session

from app.common.models import Base, SyncableBase
from app.features.movement import Movement
from app.features.transaction import Transaction
from app.features.transactiondeserialiser.models import TransactionDeserialiser

if TYPE_CHECKING:
    from app.features.userinstitutionlink import UserInstitutionLink

ModelType = TypeVar("ModelType", bound=Base)


class Account(SyncableBase):
    __tablename__ = "account"

    currency_code: Mapped[str]
    initial_balance: Mapped[Decimal]
    name: Mapped[str]
    type: Mapped[str]

    transactions: Mapped[list[Transaction]] = relationship(
        back_populates="account", cascade="all, delete", lazy="dynamic"
    )

    __mapper_args__ = {
        "polymorphic_on": "type",
        "polymorphic_identity": "account",
    }

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
    def select_accounts(cls, account_id: int | None) -> Select[tuple["Account"]]:
        statement = cls.select()
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

        statement = statement.join(cls)
        if account_id:
            statement = statement.where(cls.id == account_id)

        return statement

    @property
    def balance(self) -> Decimal:
        query = self.transactions
        first_transaction: Transaction | None = query.order_by(  # type: ignore
            *Transaction.get_timestamp_desc_clauses()
        ).first()
        if not first_transaction:
            return self.initial_balance
        return first_transaction.account_balance


class InstitutionalAccount(Account):
    is_institutional = True
    mask: Mapped[str | None]
    userinstitutionlink_id: Mapped[int] = mapped_column(
        ForeignKey("userinstitutionlink.id")
    )

    userinstitutionlink: Mapped["UserInstitutionLink"] = relationship(
        back_populates="institutionalaccounts"
    )

    __mapper_args__ = {"polymorphic_abstract": True}

    @property
    def transactiondeserialiser(self) -> TransactionDeserialiser | None:
        return self.userinstitutionlink.institution.transactiondeserialiser


class Investment(InstitutionalAccount):
    __mapper_args__ = {"polymorphic_identity": "investment"}


class Credit(InstitutionalAccount):
    __mapper_args__ = {"polymorphic_identity": "credit"}


class Depository(InstitutionalAccount):
    __mapper_args__ = {"polymorphic_identity": "depository"}


class Loan(InstitutionalAccount):
    # number: str
    # term: timedelta
    # origination_date: date
    # origination_principal_amount: Decimal
    __mapper_args__ = {"polymorphic_identity": "loan"}


class Brokerage(InstitutionalAccount):
    __mapper_args__ = {"polymorphic_identity": "brokerage"}


class Other(InstitutionalAccount):
    __mapper_args__ = {"polymorphic_identity": "other"}


class NonInstitutionalAccount(Account):
    is_institutional = False
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))

    __mapper_args__ = {"polymorphic_abstract": True}


class PersonalLedger(NonInstitutionalAccount):
    __mapper_args__ = {"polymorphic_identity": "personal ledger"}


class Cash(NonInstitutionalAccount):
    __mapper_args__ = {"polymorphic_identity": "cash"}


class Property(NonInstitutionalAccount):
    # address: str
    __mapper_args__ = {"polymorphic_identity": "property"}
