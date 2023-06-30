from decimal import Decimal
from datetime import datetime
from typing import TYPE_CHECKING
from sqlmodel import SQLModel, Relationship

from app.common.models import IdentifiableBase, CurrencyCode

from app.features.exchangerate.client import get_exchange_rate

if TYPE_CHECKING:
    from app.features.transaction.models import Transaction
    from app.features.user.models import User


class __MovementBase(SQLModel):
    ...


class MovementApiOut(__MovementBase, IdentifiableBase):
    earliest_timestamp: datetime | None
    latest_timestamp: datetime | None
    amounts: dict[CurrencyCode, Decimal]


class MovementApiIn(__MovementBase):
    ...


class Movement(__MovementBase, IdentifiableBase, table=True):
    transactions: list["Transaction"] = Relationship(
        back_populates="movement",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )

    @property
    def user(self) -> "User":
        return self.transactions[0].user

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

    @property
    def amounts(self) -> dict[CurrencyCode, Decimal]:
        return {
            c: sum(
                [
                    t.amount * get_exchange_rate(t.currency_code, c, t.timestamp.date())
                    for t in self.transactions
                ],
                Decimal(0),
            )
            for c in {t.currency_code for t in self.transactions}
        }
