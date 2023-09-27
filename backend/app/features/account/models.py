from typing import Literal, TYPE_CHECKING, Any, Optional
from decimal import Decimal
from datetime import date, timedelta

from sqlmodel import Field, SQLModel, Relationship, Session
from sqlmodel.sql.expression import SelectOfScalar

from app.common.models import (
    Base,
    CurrencyCode,
    PlaidInMixin,
    SyncableBase,
    PlaidInMixin,
    SyncableBase,
    PlaidOutMixin,
    SyncableApiOutMixin,
)

from app.features.transaction import Transaction
from app.features.transactiondeserialiser import TransactionDeserialiser
from app.features.movement import Movement


if TYPE_CHECKING:
    from app.features.institution import Institution
    from app.features.user import User
    from app.features.userinstitutionlink import UserInstitutionLink

# Bases


class __AccountBase(SQLModel):
    currency_code: CurrencyCode
    initial_balance: Decimal
    name: str
    type: str


class __AccountOut(Base):
    balance: Decimal
    is_synced: bool


class __AccountApiOut(__AccountOut, SyncableApiOutMixin):
    ...


class __AccountPlaidOut(__AccountOut, PlaidOutMixin):
    ...


# Institutional Account


class __InstitutionalAccountOut(__AccountBase):
    userinstitutionlink_id: int


class DepositoryApiIn(__AccountBase):
    type: Literal["depository"]
    bic: str | None
    iban: str | None


class LoanApiIn(__AccountBase):
    type: Literal["loan"]
    # number: str
    # term: timedelta
    # origination_date: date
    # origination_principal_amount: Decimal


class CreditApiIn(__AccountBase):
    type: Literal["credit"]


# Non institutional accounts


class __NonInstitutionalAccountOut(__AccountBase):
    user_id: int


class CashApiIn(__AccountBase):
    type: Literal["cash"]


class PersonalLedgerApiIn(__AccountBase):
    type: Literal["personal_ledger"]


class PropertyApiIn(__AccountBase):
    type: Literal["property"]
    # address: str


# fmt: off
class DepositoryApiOut(DepositoryApiIn, __InstitutionalAccountOut, __AccountApiOut): ...
class DepositoryPlaidIn(DepositoryApiIn, PlaidInMixin): ...
class DepositoryPlaidOut(DepositoryApiIn, __InstitutionalAccountOut, __AccountPlaidOut): ...

class LoanApiOut(LoanApiIn, __InstitutionalAccountOut, __AccountApiOut): ...
class LoanPlaidIn(LoanApiIn, PlaidInMixin): ...
class LoanPlaidOut(LoanApiIn, __InstitutionalAccountOut, __AccountPlaidOut): ...

class CreditApiOut(CreditApiIn, __InstitutionalAccountOut, __AccountApiOut): ...
class CreditPlaidIn(CreditApiIn, PlaidInMixin): ...
class CreditPlaidOut(CreditApiIn, __InstitutionalAccountOut, __AccountPlaidOut): ...

class CashApiOut(CashApiIn, __NonInstitutionalAccountOut, __AccountApiOut): ...
class PersonalLedgerApiOut(PersonalLedgerApiIn, __NonInstitutionalAccountOut, __AccountApiOut): ...
class PropertyApiOut(PropertyApiIn, __NonInstitutionalAccountOut, __AccountApiOut): ...

AccountApiIn = (
    DepositoryApiIn
    | LoanApiIn
    | CreditApiIn
    | CashApiIn
    | PersonalLedgerApiIn
    | PropertyApiIn
)
AccountApiOut = (
    DepositoryApiOut
    | LoanApiOut
    | CreditApiOut
    | CashApiOut
    | PersonalLedgerApiOut
    | PropertyApiOut
)
AccountPlaidIn = DepositoryPlaidIn | LoanPlaidIn | CreditPlaidIn
AccountPlaidOut = DepositoryPlaidOut | LoanPlaidOut | CreditPlaidOut
# fmt: on

# DB Model


class Account(
    SyncableBase,
    __AccountBase,
    table=True,
):
    # Institutional
    userinstitutionlink_id: int | None = Field(foreign_key="userinstitutionlink.id")
    userinstitutionlink: Optional["UserInstitutionLink"] = Relationship(
        back_populates="accounts"
    )

    # Depository
    bic: str | None
    iban: str | None

    # Loan
    # number: str | None
    # term: timedelta | None
    # origination_date: date | None
    # origination_principal_amount: Decimal | None

    # NonInstitutional
    user_id: int | None = Field(foreign_key="user.id")
    user: Optional["User"] = Relationship(back_populates="accounts")

    transactions: list[Transaction] = Relationship(
        back_populates="account",
        sa_relationship_kwargs={"cascade": "all, delete", "lazy": "dynamic"},
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
    def select_accounts(cls, account_id: int | None) -> SelectOfScalar["Account"]:
        statement = cls.select()
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

        statement = statement.join(cls)
        if account_id:
            statement = statement.where(cls.id == account_id)

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

        statement = statement.join(cls)
        if account_id:
            statement = statement.where(cls.id == account_id)

        return statement

    @property
    def transactiondeserialiser(self) -> TransactionDeserialiser | None:
        if uil := self.userinstitutionlink:
            return uil.institution.transactiondeserialiser
        return None

    @property
    def is_synced(self) -> bool:
        return self.plaid_id is not None

    @property
    def balance(self) -> Decimal:
        query = self.transactions
        first_transaction: Transaction | None = query.order_by(  # type: ignore
            *Transaction.get_timestamp_desc_clauses()
        ).first()
        if not first_transaction:
            return self.initial_balance
        return first_transaction.account_balance
