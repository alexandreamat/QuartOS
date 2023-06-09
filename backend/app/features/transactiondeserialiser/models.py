from typing import TYPE_CHECKING

from sqlmodel import SQLModel
from app.common.models import Base, CodeSnippet

if TYPE_CHECKING:
    from app.features.institution.models import Institution


from sqlmodel import Relationship


class __TransactionDeserialiserBase(SQLModel):
    module_name: str
    amount_deserialiser: CodeSnippet
    timestamp_deserialiser: CodeSnippet
    name_deserialiser: CodeSnippet
    currency_code_deserialiser: CodeSnippet
    payment_channel_deserialiser: CodeSnippet
    code_deserialiser: CodeSnippet
    skip_rows: int
    columns: int


class TransactionDeserialiserApiIn(__TransactionDeserialiserBase):
    ...


class TransactionDeserialiserApiOut(__TransactionDeserialiserBase, Base):
    ...


class TransactionDeserialiser(__TransactionDeserialiserBase, Base, table=True):
    institutions: list["Institution"] = Relationship(
        back_populates="transactiondeserialiser"
    )
