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
import base64

from sqlalchemy.orm import Mapped, mapped_column

from app.models.common import SyncableBase


class Category(SyncableBase):
    __tablename__ = "category"
    name: Mapped[str] = mapped_column(unique=True)
    icon: Mapped[bytes]

    @property
    def icon_base64(self) -> str:
        return base64.b64encode(self.icon).decode()

    @icon_base64.setter
    def icon_base64(self, value: str) -> None:
        self.icon = base64.b64decode(value.encode())
