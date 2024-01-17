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

from typing import Iterable

from fastapi import APIRouter

from app.database.deps import DBSession
from app.features.account import CRUDAccount
from app.features.movement import MovementApiOut
from app.features.transaction import TransactionApiIn
from app.features.user import CurrentUser, CRUDUser
from . import transactions

router = APIRouter()


@router.post("/")
def create_many(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    transactions: list[TransactionApiIn],
    transaction_ids: list[int],
) -> Iterable[MovementApiOut]:
    CRUDUser.read_account(db, me.id, None, account_id)
    for transaction_id in transaction_ids:
        CRUDUser.read_transaction(db, me.id, None, account_id, None, transaction_id)
    yield from CRUDAccount.create_many_movements(
        db, account_id, transactions, transaction_ids
    )


router.include_router(
    transactions.router,
    prefix="/{movement_id}/transactions",
    tags=["transactions"],
)
