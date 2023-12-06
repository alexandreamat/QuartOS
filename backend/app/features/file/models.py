from typing import TYPE_CHECKING
from datetime import datetime

from sqlmodel import SQLModel, Field, Relationship

from app.common.models import Base, ApiOutMixin, ApiInMixin

if TYPE_CHECKING:
    from app.features.transaction import Transaction


class __FileBase(SQLModel):
    name: str


class FileApiOut(__FileBase, ApiOutMixin):
    uploaded: datetime
    transaction_id: int


class FileApiIn(__FileBase, ApiInMixin):
    data: bytes


class File(__FileBase, Base, table=True):
    data: bytes
    uploaded: datetime
    transaction_id: int = Field(foreign_key="transaction.id")

    transaction: "Transaction" = Relationship(back_populates="files")
