from decimal import Decimal
from datetime import datetime
from typing import TYPE_CHECKING
from sqlmodel import SQLModel, Relationship

from app.common.models import IdentifiableBase

if TYPE_CHECKING:
    from app.features.transaction.models import Transaction


class __MovementBase(SQLModel):
    ...


class MovementApiOut(__MovementBase, IdentifiableBase):
    amount: Decimal | None
    currency_code: str | None
    earliest_timestamp: datetime | None
    latest_timestamp: datetime | None


class MovementApiIn(__MovementBase):
    ...


class Movement(__MovementBase, IdentifiableBase, table=True):
    transactions: list["Transaction"] = Relationship(back_populates="movement")

    @property
    def amount(self) -> Decimal | None:
        if len({t.currency_code for t in self.transactions}) != 1:
            return None
        return sum([t.amount for t in self.transactions], Decimal(0))

    @property
    def currency_code(self) -> str | None:
        if len({t.currency_code for t in self.transactions}) != 1:
            return None
        return self.transactions[0].currency_code

    @property
    def earliest_timestamp(self) -> datetime | None:
        try:
            return min(t.timestamp for t in self.transactions if t.timestamp)
        except ValueError:
            return None

    @property
    def latest_timestamp(self) -> datetime | None:
        try:
            return max(t.timestamp for t in self.transactions if t.timestamp)
        except ValueError:
            return None
