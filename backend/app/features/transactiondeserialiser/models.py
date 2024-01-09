# Copyright (C) 2024 Alexandre Amat
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Relationship
from app.common.models import Base, CodeSnippet

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


class TransactionDeserialiserApiIn(__TransactionDeserialiserBase):
    ...


class TransactionDeserialiserApiOut(__TransactionDeserialiserBase, Base):
    ...


class TransactionDeserialiser(__TransactionDeserialiserBase, Base, table=True):
    institutions: list["Institution"] = Relationship(
        back_populates="transactiondeserialiser"
    )
