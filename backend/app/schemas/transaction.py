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

from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING, Any, Literal

from pydantic import BaseModel

from app.schemas.account import AnnotatedLiteral
from app.schemas.common import (
    PlaidInMixin,
    PlaidOutMixin,
    SyncableApiOutMixin,
    ApiInMixin,
)

if TYPE_CHECKING:
    pass


class __TransactionBase(BaseModel):
    timestamp: date
    name: str
    category_id: int | None = None


class TransactionApiOut(__TransactionBase, SyncableApiOutMixin):
    transaction_group_id: int | None
    amount_default_currency: Decimal
    amount: Decimal
    account_balance: Decimal
    account_id: int
    is_synced: bool
    consolidated: AnnotatedLiteral(False)

    @classmethod
    def model_validate(cls, obj: Any, **kwargs: Any) -> "TransactionApiOut":
        if hasattr(obj, "_asdict"):
            transaction_dict: dict[str, Any] = obj._asdict()
            return cls(**transaction_dict, consolidated=False)
        return super().model_validate(obj, **kwargs)


class TransactionApiIn(__TransactionBase, ApiInMixin):
    amount: Decimal


class TransactionPlaidIn(TransactionApiIn, PlaidInMixin): ...


class TransactionPlaidOut(TransactionApiOut, PlaidOutMixin): ...


class TransactionQueryArg(BaseModel):
    __schema__ = TransactionApiOut
    search: str | None = None
    consolidated: bool = False
    per_page: int = 0
    page: int = 0
    order_by: Literal[
        "id__asc",
        "id__desc",
        "timestamp__asc",
        "timestamp__desc",
        "amount_default_currency__asc",
        "amount_default_currency__desc",
        "amount__asc",
        "amount__desc",
        "account_balance__asc",
        "account_balance__desc",
        "account_id__asc",
        "account_id__desc",
        None,
    ] = None
    id__eq: int | None = None
    timestamp__eq: date | None = None
    timestamp__gt: date | None = None
    timestamp__ge: date | None = None
    timestamp__le: date | None = None
    timestamp__lt: date | None = None
    name__eq: str | None = None
    category_id__eq: int | None = None
    transaction_group_id__eq: int | None = None
    amount_default_currency__eq: Decimal | None = None
    amount_default_currency__eq__abs: Decimal | None = None
    amount_default_currency__gt: Decimal | None = None
    amount_default_currency__gt__abs: Decimal | None = None
    amount_default_currency__ge: Decimal | None = None
    amount_default_currency__ge__abs: Decimal | None = None
    amount_default_currency__le: Decimal | None = None
    amount_default_currency__le__abs: Decimal | None = None
    amount_default_currency__lt: Decimal | None = None
    amount_default_currency__lt__abs: Decimal | None = None
    amount__eq: Decimal | None = None
    amount__eq__abs: Decimal | None = None
    amount__gt: Decimal | None = None
    amount__gt__abs: Decimal | None = None
    amount__ge: Decimal | None = None
    amount__ge__abs: Decimal | None = None
    amount__le: Decimal | None = None
    amount__le__abs: Decimal | None = None
    amount__lt: Decimal | None = None
    amount__lt__abs: Decimal | None = None
    account_balance__eq: Decimal | None = None
    account_balance__eq__abs: Decimal | None = None
    account_balance__gt: Decimal | None = None
    account_balance__gt__abs: Decimal | None = None
    account_balance__ge: Decimal | None = None
    account_balance__ge__abs: Decimal | None = None
    account_balance__le: Decimal | None = None
    account_balance__le__abs: Decimal | None = None
    account_balance__lt: Decimal | None = None
    account_balance__lt__abs: Decimal | None = None
    account_id__eq: int | None = None
