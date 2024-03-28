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
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, relationship, mapped_column

from app.models.common import Base
from app.models.transaction import Transaction

if TYPE_CHECKING:
    from app.models.user import User


class Bucket(Base):
    __tablename__ = "bucket"

    name: Mapped[str]

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))

    # user: Mapped["User"] = relationship()
    transactions: Mapped[list[Transaction]] = relationship(back_populates="bucket")
