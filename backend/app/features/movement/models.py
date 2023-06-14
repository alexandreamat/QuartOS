from typing import TYPE_CHECKING
from sqlmodel import SQLModel, Relationship

from app.common.models import IdentifiableBase

if TYPE_CHECKING:
    from app.features.transaction.models import Transaction


class __MovementBase(SQLModel):
    ...


class MovementApiOut(__MovementBase, IdentifiableBase):
    # transactions: List[TransactionApiOut] # does not work
    ...


class MovementApiIn(__MovementBase):
    ...


class Movement(__MovementBase, IdentifiableBase, table=True):
    transactions: "Transaction" = Relationship(back_populates="movement")
