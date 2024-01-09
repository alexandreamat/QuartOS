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

from fastapi import APIRouter

from app.database.deps import DBSession

from app.features.user import CurrentSuperuser
from app.features.transaction import (
    CRUDSyncableTransaction,
    TransactionPlaidIn,
    TransactionPlaidOut,
)

router = APIRouter()


@router.get("/plaid/{id}")
def read_plaid(db: DBSession, me: CurrentSuperuser, id: int) -> TransactionPlaidOut:
    return CRUDSyncableTransaction.read(db, id)


@router.put("/plaid/{id}")
def update_plaid(
    db: DBSession,
    me: CurrentSuperuser,
    id: int,
    transaction_in: TransactionPlaidIn,
) -> TransactionPlaidOut:
    return CRUDSyncableTransaction.update(db, id, transaction_in)
