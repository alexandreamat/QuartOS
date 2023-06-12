from typing import Optional
from enum import Enum
from decimal import Decimal
from datetime import datetime, timedelta
import pytz

from sqlmodel import Field, Relationship, SQLModel, Session
from pydantic import validator

from app.common.models import IdentifiableBase, CurrencyCode, PlaidBase, PlaidMaybeMixin
from app.features.institution.models import Institution
from app.features.user.models import User
from app.features.userinstitutionlink.models import UserInstitutionLink
from app.features.account.models import Account


class PaymentChannel(str, Enum):
    ONLINE = "online"
    IN_STORE = "in store"
    OTHER = "other"


class TransactionCode(str, Enum):
    ADJUSTMENT = "adjustment"
    ATM = "atm"
    BANK_CHARGE = "bank charge"
    BILL_PAYMENT = "bill payment"
    CASH = "cash"
    CASHBACK = "cashback"
    CHEQUE = "cheque"
    DIRECT_DEBIT = "direct debit"
    INTEREST = "interest"
    PURCHASE = "purchase"
    STANDING_ORDER = "standing order"
    TRANSFER = "transfer"
    NULL = "null"


class __TransactionBase(SQLModel):
    amount: Decimal
    timestamp: datetime | None
    name: str
    currency_code: CurrencyCode
    account_id: int
    payment_channel: PaymentChannel
    code: TransactionCode | None
    related_transaction_id: int | None


class TransactionApiOut(__TransactionBase, IdentifiableBase):
    ...

    @validator("timestamp", pre=True)
    def convert_to_utc_aware(cls, v: datetime | None) -> datetime | None:
        return v.replace(tzinfo=pytz.UTC) if v else None


class TransactionApiIn(__TransactionBase):
    timestamp: datetime
    code: TransactionCode

    # @validator("timestamp")
    # def validate_utc(cls, v: datetime) -> datetime:
    #     if v.tzinfo is None or v.tzinfo.utcoffset(v) != timedelta(0):
    #         raise ValueError("Expected timestamp in UTC timezone")
    #     return v


class TransactionPlaidIn(__TransactionBase, PlaidBase):
    ...


class TransactionPlaidOut(__TransactionBase, PlaidBase, IdentifiableBase):
    ...


class Transaction(__TransactionBase, IdentifiableBase, PlaidMaybeMixin, table=True):
    account_id: int = Field(foreign_key="account.id")
    account: Account = Relationship(back_populates="transactions")

    related_transaction_id: int | None = Field(foreign_key="transaction.id")
    linked_transaction: Optional["Transaction"] = Relationship(
        sa_relationship_kwargs={"uselist": False}
    )

    @validator("timestamp", pre=True)
    def convert_to_utc_naive(cls, v: datetime | None) -> datetime | None:
        return v.astimezone(pytz.UTC).replace(tzinfo=None) if v else None

    @classmethod
    def link(cls, db: Session, a_id: int, b_id: int) -> None:
        a = cls.read(db, a_id)
        b = cls.read(db, b_id)
        a.related_transaction_id = b.id
        b.related_transaction_id = a.id

    @property
    def user(self) -> User:
        return self.account.user

    @property
    def institution(self) -> Institution | None:
        return self.account.institution

    @property
    def userinstitutionlink(self) -> UserInstitutionLink | None:
        return self.account.userinstitutionlink

    @property
    def is_synced(self) -> bool:
        return self.account.is_synced
