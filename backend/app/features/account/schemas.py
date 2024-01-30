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
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel

from app.common.schemas import (
    PlaidInMixin,
    ApiInMixin,
    SyncableApiOutMixin,
    PlaidOutMixin,
    ApiOutMixin,
    CurrencyCode,
)


class _AccountBase(BaseModel):
    class InstitutionalAccount(BaseModel):
        type: Literal[
            "investment", "credit", "depository", "loan", "brokerage", "other"
        ]
        mask: str

    class NonInstitutionalAccount(BaseModel):
        type: Literal["personal ledger", "cash", "property"]

    currency_code: CurrencyCode
    initial_balance: Decimal
    name: str


class AccountApiIn(_AccountBase, ApiInMixin):
    class InstitutionalAccount(_AccountBase.InstitutionalAccount, ApiInMixin):
        ...

    class NonInstitutionalAccount(_AccountBase.NonInstitutionalAccount, ApiInMixin):
        ...

    institutionalaccount: InstitutionalAccount | None = None
    noninstitutionalaccount: NonInstitutionalAccount | None = None


class AccountApiOut(_AccountBase, ApiOutMixin):
    class InstitutionalAccount(_AccountBase.InstitutionalAccount, SyncableApiOutMixin):
        userinstitutionlink_id: int

    class NonInstitutionalAccount(_AccountBase.NonInstitutionalAccount, ApiOutMixin):
        user_id: int

    institutionalaccount: InstitutionalAccount | None
    noninstitutionalaccount: NonInstitutionalAccount | None
    is_synced: bool
    balance: Decimal


class AccountPlaidIn(_AccountBase):
    class InstitutionalAccount(_AccountBase.InstitutionalAccount, PlaidInMixin):
        ...

    institutionalaccount: InstitutionalAccount


class AccountPlaidOut(_AccountBase, ApiOutMixin):
    class InstitutionalAccount(_AccountBase.InstitutionalAccount, PlaidOutMixin):
        ...

    institutionalaccount: InstitutionalAccount
