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

from typing import Any

from sqlalchemy import Select

from app.crud.common import CRUDBase
from app.models.merchant import Merchant
from app.schemas.merchant import MerchantApiOut, MerchantApiIn


class CRUDMerchant(
    CRUDBase[Merchant, MerchantApiOut, MerchantApiIn],
):
    __model__ = Merchant
    __out_schema__ = MerchantApiOut

    @classmethod
    def select(
        cls, *, id: int | None = None, user_id: int | None = None, **kwargs: Any
    ) -> Select[tuple[Merchant]]:
        statement = super().select(id=id, **kwargs)
        if user_id:
            statement = statement.where(Merchant.user_id == user_id)
        return statement
