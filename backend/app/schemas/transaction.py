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
from typing import TYPE_CHECKING, Any

from pydantic import BaseModel
from app.schemas.account import AnnotatedLiteral

from app.schemas.common import (
    ApiOutMixin,
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
    category_id: int | None


class TransactionApiOut(__TransactionBase, SyncableApiOutMixin):
    movement_id: int
    amount_default_currency: Decimal
    amount: Decimal
    account_balance: Decimal
    account_id: int
    is_synced: bool
    consolidated: AnnotatedLiteral(False)
    transactions_count: AnnotatedLiteral(1)

    @classmethod
    def model_validate(cls, obj: Any, **kwargs: Any) -> "TransactionApiOut":
        transaction_dict: dict[str, Any] = obj._asdict()
        return cls(**transaction_dict, consolidated=False, transactions_count=1)


class ConsolidatedTransactionApiOut(__TransactionBase, ApiOutMixin):
    amount_default_currency: Decimal
    amount: Decimal | None
    account_balance: Decimal | None
    account_id: int | None
    is_synced: bool
    consolidated: AnnotatedLiteral(True)
    transactions_count: int

    @classmethod
    def model_validate(cls, obj: Any, **kwargs: Any) -> "ConsolidatedTransactionApiOut":
        transaction_dict: dict[str, Any] = obj._asdict()

        if obj.account_id_min == obj.account_id_max:
            account_id = obj.account_id_min
        else:
            account_id = None
        transaction_dict.update(account_id=account_id)

        amount = None if obj.currency_codes != 1 else obj.amount
        transaction_dict.update(amount=amount)

        return cls(**transaction_dict, consolidated=True)


class TransactionApiIn(__TransactionBase, ApiInMixin):
    amount: Decimal


class TransactionPlaidIn(TransactionApiIn, PlaidInMixin): ...


class TransactionPlaidOut(TransactionApiOut, PlaidOutMixin): ...
