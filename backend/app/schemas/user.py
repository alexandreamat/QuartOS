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
from pydantic import EmailStr

from app.schemas.common import ApiInMixin, ApiOutMixin, CurrencyCode
from app.utils.common import AnnotatedLiteral


class __UserBase(BaseModel):
    email: EmailStr
    full_name: str
    default_currency_code: CurrencyCode
    type: str


class __DefaultUser(__UserBase):
    type: AnnotatedLiteral("defaultuser")


class __SuperUser(__UserBase):
    type: AnnotatedLiteral("superuser")


class __DemoUser(__UserBase):
    client_host: str
    type: AnnotatedLiteral("demouser")


class DefaultUserApiIn(__DefaultUser, ApiInMixin):
    password: str


class SuperUserApiIn(__SuperUser, ApiInMixin): ...


class DemoUserApiIn(__DemoUser, ApiInMixin): ...


class DefaultUserApiOut(__DefaultUser, ApiOutMixin): ...


class SuperUserApiOut(__SuperUser, ApiOutMixin): ...


class DemoUserApiOut(__DemoUser, ApiOutMixin): ...


UserApiOut = DefaultUserApiOut | SuperUserApiOut | DemoUserApiOut
UserApiIn = DefaultUserApiIn | SuperUserApiIn | DemoUserApiIn
