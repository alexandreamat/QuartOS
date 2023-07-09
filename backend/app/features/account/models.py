from typing import TYPE_CHECKING, Any
from decimal import Decimal
from enum import Enum
from datetime import datetime

from sqlmodel import Field, Relationship, SQLModel, Session
from sqlmodel import desc, asc
from pydantic import root_validator, validator
import pycountry

from app.common.models import Base, CurrencyCode, SyncedMixin, SyncableBase, SyncedBase
from app.features.institution.models import Institution
from app.features.user.models import User
from app.features.userinstitutionlink.models import UserInstitutionLink
from app.features.transactiondeserialiser.models import TransactionDeserialiser

if TYPE_CHECKING:
    from app.features.transaction.models import Transaction


class _AccountBase(SQLModel):
    class InstitutionalAccount(SQLModel):
        class InstitutionalAccountType(str, Enum):
            INVESTMENT = "investment"
            CREDIT = "credit"
            DEPOSITORY = "depository"
            LOAN = "loan"
            BROKERAGE = "brokerage"
            OTHER = "other"

        userinstitutionlink_id: int
        type: InstitutionalAccountType
        mask: str

    class NonInstitutionalAccount(SQLModel):
        class NonInstitutionalAccountType(str, Enum):
            PERSONAL_LEDGER = "personal ledger"
            CASH = "cash"
            PROPERTY = "property"

        type: NonInstitutionalAccountType
        user_id: int | None

    currency_code: CurrencyCode
    initial_balance: Decimal
    name: str

    @validator("currency_code")
    def currency_code_must_exist(cls, value: str) -> str:
        if value not in [currency.alpha_3 for currency in pycountry.currencies]:
            raise ValueError("Invalid currency code")
        return value

    @root_validator()
    def only_one_type_allowed(
        cls,
        values: dict[str, Any],
    ) -> dict[str, Any]:
        institutionalaccount = values.get("institutionalaccount")
        noninstitutionalaccount = values.get("noninstitutionalaccount")
        if bool(institutionalaccount) is bool(noninstitutionalaccount):
            raise ValueError("One and only one account must be defined")
        return values


class AccountApiIn(_AccountBase):
    class InstitutionalAccount(_AccountBase.InstitutionalAccount):
        ...

    class NonInstitutionalAccount(_AccountBase.NonInstitutionalAccount):
        ...

    institutionalaccount: InstitutionalAccount | None
    noninstitutionalaccount: NonInstitutionalAccount | None


class AccountApiOut(_AccountBase, Base):
    class InstitutionalAccount(_AccountBase.InstitutionalAccount, Base):
        ...

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

        userinstitutionlink: UserInstitutionLink = Relationship(
            back_populates="institutionalaccounts"
        )
        account: "Account" = Relationship(
            back_populates="institutionalaccount",
            sa_relationship_kwargs={"uselist": False},
        )

        @property
        def user(self) -> User:
            return self.userinstitutionlink.user

        @property
        def institution(self) -> Institution:
            return self.userinstitutionlink.institution

        @property
        def transactiondeserialiser(self) -> TransactionDeserialiser | None:
            return self.userinstitutionlink.institution.transactiondeserialiser

        @property
        def is_synced(self) -> bool:
            return self.userinstitutionlink.is_synced

    class NonInstitutionalAccount(
        _AccountBase.NonInstitutionalAccount, Base, table=True
    ):
        user_id: int = Field(foreign_key="user.id")
        user: User = Relationship(back_populates="noninstitutionalaccounts")
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

    transactions: list["Transaction"] = Relationship(
        back_populates="account",
        sa_relationship_kwargs={
            "cascade": "all, delete",
            "lazy": "dynamic",
        },
    )

    @classmethod
    def from_schema(cls, obj_in: AccountApiIn) -> "Account":  # type: ignore[override]
        obj_in_dict = obj_in.dict(
            exclude={"institutionalaccount", "noninstitutionalaccount"}
        )
        if obj_in.institutionalaccount:
            return Account(
                **obj_in_dict,
                institutionalaccount=Account.InstitutionalAccount(
                    **obj_in.institutionalaccount.dict()
                ),
            )
        if obj_in.noninstitutionalaccount:
            return Account(
                **obj_in_dict,
                noninstitutionalaccount=Account.NonInstitutionalAccount(
                    **obj_in.noninstitutionalaccount.dict()
                ),
            )
        raise ValueError

    @classmethod
    def update(cls, db: Session, id: int, obj_in: "Account") -> "Account":
        obj = cls.read(db, id)
        obj_in_dict = obj_in.dict(
            exclude={"institutionalaccount", "noninstitutionalaccount"}
        )
        for key, value in obj_in_dict.items():
            setattr(obj, key, value)
        if obj.institutionalaccount_id and obj_in.institutionalaccount:
            obj.institutionalaccount = Account.InstitutionalAccount.update(
                db, obj.institutionalaccount_id, obj_in.institutionalaccount
            )
            return obj

        if obj.noninstitutionalaccount_id and obj_in.noninstitutionalaccount:
            obj.noninstitutionalaccount = Account.NonInstitutionalAccount.update(
                db, obj.noninstitutionalaccount_id, obj_in.noninstitutionalaccount
            )
            return obj

        raise ValueError

    @classmethod
    def update_balance(
        cls, db: Session, id: int, timestamp: datetime | None = None
    ) -> "Account":
        from app.features.transaction import Transaction  # type: ignore[attr-defined]

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
            asc(Transaction.timestamp)
        ).yield_per(100)

        for result in transactions_query:
            transaction: Transaction = result
            transaction.account_balance = prev_balance + transaction.amount
            Transaction.update(db, transaction.id, transaction)
            prev_balance = transaction.account_balance

        return cls.read(db, id)

    @property
    def user(self) -> User:
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
    def institution(self) -> Institution | None:
        if self.institutionalaccount:
            return self.institutionalaccount.institution
        return None

    @property
    def userinstitutionlink(self) -> UserInstitutionLink | None:
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
        from app.features.transaction.models import Transaction

        query = self.transactions
        first_transaction: "Transaction" | None = query.order_by(  # type: ignore
            *Transaction.get_timestamp_desc_clauses()
        ).first()
        if not first_transaction:
            return self.initial_balance
        return first_transaction.account_balance
