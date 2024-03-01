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

from sqlalchemy.orm import Mapped, relationship

from app.models.common import Base

if TYPE_CHECKING:
    from app.models.institution import Institution


class TransactionDeserialiser(Base):
    __tablename__ = "transactiondeserialiser"
    module_name: Mapped[str]
    amount_deserialiser: Mapped[str]
    timestamp_deserialiser: Mapped[str]
    name_deserialiser: Mapped[str]
    skip_rows: Mapped[int]
    ascending_timestamp: Mapped[bool]
    columns: Mapped[int]
    delimiter: Mapped[str]
    encoding: Mapped[str]

    institutions: Mapped[list["Institution"]] = relationship(
        back_populates="transactiondeserialiser"
    )
