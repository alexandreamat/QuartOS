from typing import TYPE_CHECKING

from sqlmodel import SQLModel
from app.common.models import IdentifiableBase, CodeSnippet

if TYPE_CHECKING:
    from app.features.institution.models import Institution


from sqlmodel import Relationship


class __TransactionDeserialiserBase(SQLModel):
    amount: CodeSnippet
    datetime: CodeSnippet
    name: CodeSnippet
    currency_code: CodeSnippet
    payment_channel: CodeSnippet
    code: CodeSnippet


class TransactionDeserialiserApiIn(__TransactionDeserialiserBase):
    ...


class TransactionDeserialiserApiOut(__TransactionDeserialiserBase, IdentifiableBase):
    ...


class TransactionDeserialiser(
    __TransactionDeserialiserBase, IdentifiableBase, table=True
):
    institutions: list["Institution"] = Relationship(
        back_populates="transactiondeserialiser"
    )
