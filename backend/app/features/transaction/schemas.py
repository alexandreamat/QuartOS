from sqlmodel import SQLModel
from datetime import datetime

from app.common.models import Base


class TransactionBase(SQLModel):
    amount: int
    timestamp: datetime
    description: str
    currency: str
    category: str


class TransactionRead(TransactionBase, Base):
    ...


class TransactionWrite(TransactionBase):
    ...
