from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Relationship
from app.common.models import Base, CodeSnippet, ApiInMixin, ApiOutMixin

if TYPE_CHECKING:
    from app.features.institution.models import Institution


class __TransactionDeserialiserBase(SQLModel):
    module_name: str
    amount_deserialiser: CodeSnippet
    timestamp_deserialiser: CodeSnippet
    name_deserialiser: CodeSnippet
    skip_rows: int
    columns: int
    delimiter: str
    encoding: str


class TransactionDeserialiserApiIn(__TransactionDeserialiserBase, ApiInMixin):
    ...


class TransactionDeserialiserApiOut(__TransactionDeserialiserBase, ApiOutMixin):
    ...


class TransactionDeserialiser(__TransactionDeserialiserBase, Base, table=True):
    institutions: list["Institution"] = Relationship(
        back_populates="transactiondeserialiser"
    )
