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

import logging
from decimal import Decimal
from typing import Iterable

from fastapi import APIRouter, Depends

from app.crud.consolidatedtransaction import CRUDConsolidatedTransaction
from app.crud.transaction import CRUDTransaction
from app.crud.transactiongroup import CRUDTransactionGroup
from app.database.deps import DBSession
from app.deps.user import CurrentUser
from app.schemas.transaction import TransactionApiOut, TransactionQueryArg
from app.schemas.transactiongroup import TransactionGroupApiIn, TransactionGroupApiOut

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/")
def read_many(
    db: DBSession, me: CurrentUser, arg: TransactionQueryArg = Depends()
) -> Iterable[TransactionApiOut | TransactionGroupApiOut]:
    return CRUDConsolidatedTransaction.read_many(
        db,
        user_id=me.id,
        **arg.model_dump(exclude_none=True),
    )


@router.post("/")
def consolidate(
    db: DBSession, me: CurrentUser, transaction_ids: list[int]
) -> TransactionGroupApiOut:
    max_amount = Decimal("0")
    for transaction_id in transaction_ids:
        transaction_out = CRUDTransaction.read(db, id=transaction_id, user_id=me.id)
        amount = abs(transaction_out.amount)
        if amount > max_amount:
            max_amount = amount
            name = transaction_out.name
    transaction_group_in = TransactionGroupApiIn(name=name)
    transaction_group_out = CRUDTransactionGroup.create(
        db, transaction_group_in, transaction_ids=transaction_ids
    )
    return TransactionGroupApiOut.model_validate(transaction_group_out)
