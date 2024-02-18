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

from app.common.schemas import (
    ApiOutMixin,
    PlaidInMixin,
    PlaidOutMixin,
    SyncableApiOutMixin,
    ApiInMixin,
)
from app.features.account.schemas import AnnotatedLiteral
from app.features.file import FileApiOut

if TYPE_CHECKING:
    pass


class __TransactionBase(BaseModel):
    timestamp: date
    name: str
    category_id: int | None
    movement_id: int | None
    amount_default_currency: Decimal


class TransactionApiOut(__TransactionBase, SyncableApiOutMixin):
    amount: Decimal
    account_balance: Decimal
    account_id: int
    is_synced: bool
    consolidated: AnnotatedLiteral(False) = False


class ConsolidatedTransactionApiOut(__TransactionBase, ApiOutMixin):
    amount: Decimal | None
    consolidated: AnnotatedLiteral(True) = True
    transactions_count: int
    account_id: int | None

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

        return cls(**transaction_dict)


class TransactionApiIn(__TransactionBase, ApiInMixin): ...


class TransactionPlaidIn(TransactionApiIn, PlaidInMixin): ...


class TransactionPlaidOut(TransactionApiOut, PlaidOutMixin): ...
