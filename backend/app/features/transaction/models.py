from enum import Enum

from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime
from decimal import Decimal

from app.common.models import Base, CurrencyCode
from app.features.institution.models import Institution
from app.features.user.models import User
from app.features.userinstitutionlink.models import UserInstitutionLink
from app.features.account.models import Account


class PaymentChannel(str, Enum):
    ONLINE = "online"
    IN_STORE = "in store"
    OTHER = "other"


class Code(str, Enum):
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


class TransactionBase(SQLModel):
    amount: Decimal
    datetime: datetime
    name: str
    currency_code: CurrencyCode
    account_id: int
    payment_channel: PaymentChannel
    code: Code


class TransactionRead(TransactionBase, Base):
    ...


class TransactionWrite(TransactionBase):
    ...


class TransactionSync(TransactionWrite):
    plaid_id: str


class Transaction(TransactionBase, Base, table=True):
    account_id: int = Field(foreign_key="account.id")
    plaid_id: str | None = Field(unique=True)

    account: Account = Relationship(back_populates="transactions")

    @property
    def user(self) -> User:
        return self.account.userinstitutionlink.user

    @property
    def institution(self) -> Institution:
        return self.account.userinstitutionlink.institution

    @property
    def user_institution_link(self) -> UserInstitutionLink:
        return self.account.userinstitutionlink

    @property
    def is_synced(self) -> bool:
        return self.account.is_synced
