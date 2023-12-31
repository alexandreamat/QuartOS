from typing import Literal, TYPE_CHECKING, Any, Iterable
from decimal import Decimal
from datetime import date

from sqlmodel import SQLModel, Relationship, Session
from sqlmodel.sql.expression import SelectOfScalar

from app.common.models import (
    SyncableBase,
    ApiInMixin,
    SyncableApiOutMixin,
    PlaidInMixin,
    PlaidOutMixin,
    CurrencyCode,
)

from app.features.transaction import Transaction
from app.features.transactiondeserialiser import TransactionDeserialiser
from app.features.movement import Movement
from app.features.accountacces import AccountAccess


if TYPE_CHECKING:
    from app.features.user import User
    from app.features.userinstitutionlink import UserInstitutionLink

logger = logging.getLogger()


class __AccountBase(SQLModel):
    currency_code: CurrencyCode
    initial_balance: Decimal
    name: str
    type: str


class __AccountOut(SQLModel):
    balance: Decimal
    is_synced: bool


class __InstitutionalAccountOut(__AccountOut):
    userinstitutionlink_id: int


class __NonInstitutionalAccountOut(__AccountOut):
    user_id: int


class __Depository(__AccountBase):
    type: Literal["depository"]
    bic: str | None
    iban: str | None


class __Loan(__AccountBase):
    type: Literal["loan"]
    # number: str
    # term: timedelta
    # origination_date: date
    # origination_principal_amount: Decimal


class __Credit(__AccountBase):
    type: Literal["credit"]


class __Cash(__AccountBase):
    type: Literal["cash"]


class __PersonalLedger(__AccountBase):
    type: Literal["personal_ledger"]


class __Property(__AccountBase, ApiInMixin):
    type: Literal["property"]
    # address: str


# fmt: off
class DepositoryApiIn(__Depository, ApiInMixin): ...
class DepositoryApiOut(__Depository, __InstitutionalAccountOut, SyncableApiOutMixin): ...
class DepositoryPlaidIn(__Depository, PlaidInMixin): ...
class DepositoryPlaidOut(__Depository, __InstitutionalAccountOut, PlaidOutMixin): ...
class LoanApiIn(__Loan, ApiInMixin): ...
class LoanApiOut(__Loan, __InstitutionalAccountOut, SyncableApiOutMixin): ...
class LoanPlaidIn(__Loan, PlaidInMixin): ...
class LoanPlaidOut(__Loan, __InstitutionalAccountOut, PlaidOutMixin): ...
class CreditApiIn(__Credit, ApiInMixin): ...
class CreditApiOut(__Credit, __InstitutionalAccountOut, SyncableApiOutMixin): ...
class CreditPlaidIn(__Credit, PlaidInMixin): ...
class CreditPlaidOut(__Credit, __InstitutionalAccountOut, PlaidOutMixin): ...
class CashApiIn(__Cash, ApiInMixin): ...
class CashApiOut(__Cash, __NonInstitutionalAccountOut, SyncableApiOutMixin): ...
class PersonalLedgerApiIn(__PersonalLedger, ApiInMixin): ...
class PersonalLedgerApiOut(__PersonalLedger, __NonInstitutionalAccountOut, SyncableApiOutMixin): ...
class PropertyApiIn(__Property): ...
class PropertyApiOut(__Property, __NonInstitutionalAccountOut, SyncableApiOutMixin): ...
# fmt: on

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

# DB Model


class Account(
    SyncableBase,
    __AccountBase,
    table=True,
):
    # Depository
    bic: str | None
    iban: str | None

    # Loan
    # number: str | None
    # term: timedelta | None
    # origination_date: date | None
    # origination_principal_amount: Decimal | None

    transactions: list[Transaction] = Relationship(
        back_populates="account",
        sa_relationship_kwargs={"cascade": "all, delete", "lazy": "dynamic"},
    )

    accesses: list["AccountAccess"] = Relationship(back_populates="account")

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
        statement = cls.select().join(AccountAccess)

        if account_id:
            statement = statement.where(cls.id == account_id)

        return statement

    @classmethod
    def select_account_accesses(
        cls, account_id: int | None, accountaccess_id: int | None
    ) -> SelectOfScalar[AccountAccess]:
        statement = AccountAccess.select_account_accesses(accountaccess_id)

        if account_id:
            statement = statement.where(cls.id == account_id)

        return statement

    @classmethod
    def select_movements(
        cls,
        account_id: int | None,
        accountaccess_id: int | None,
        movement_id: int | None,
        **kwargs: Any,
    ) -> SelectOfScalar[Movement]:
        statement = AccountAccess.select_movements(
            accountaccess_id, movement_id, **kwargs
        )
        statement = statement.join(cls)
        if account_id:
            statement = statement.where(cls.id == account_id)

        return statement

    @classmethod
    def select_transactions(
        cls,
        account_id: int | None,
        accountaccess_id: int | None,
        movement_id: int | None,
        transaction_id: int | None,
        **kwargs: Any,
    ) -> SelectOfScalar[Transaction]:
        statement = AccountAccess.select_transactions(
            accountaccess_id, movement_id, transaction_id, **kwargs
        )

        statement = statement.join(cls)
        if account_id:
            statement = statement.where(cls.id == account_id)

        return statement

    @property
    def users(self) -> Iterable["User"]:
        for a in self.accesses:
            yield a.user

    @property
    def userinstitutionlinks(self) -> Iterable["UserInstitutionLink"]:
        for a in self.accesses:
            if a.userinstitutionlink:
                yield a.userinstitutionlink

    @property
    def transactiondeserialiser(self) -> TransactionDeserialiser | None:
        if uils := self.userinstitutionlinks:
            for uil in uils:
                # return first transaction deserialiser
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
