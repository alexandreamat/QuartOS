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
from pydantic import BaseModel

from app.schemas.common import ApiInMixin, ApiOutMixin, RegexPattern


class __Merchant(BaseModel):
    name: str
    pattern: RegexPattern
    default_category_id: int


class MerchantApiIn(__Merchant, ApiInMixin):
    ...


class MerchantApiOut(__Merchant, ApiOutMixin):
    user_id: int
