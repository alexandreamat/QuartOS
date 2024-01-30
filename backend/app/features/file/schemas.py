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

from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import SQLModel

from app.common.schemas import ApiOutMixin, ApiInMixin

if TYPE_CHECKING:
    pass


class __FileBase(SQLModel):
    name: str


class FileApiOut(__FileBase, ApiOutMixin):
    uploaded: datetime
    transaction_id: int


class FileApiIn(__FileBase, ApiInMixin):
    data: bytes
