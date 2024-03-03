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

from app.crud.merchant import CRUDMerchant
from app.database.deps import DBSession
from app.deps.user import CurrentUser
from app.schemas.merchant import MerchantApiIn, MerchantApiOut

router = APIRouter()


@router.post("/")
def create(
    db: DBSession, me: CurrentUser, merchant_in: MerchantApiIn
) -> MerchantApiOut:
    m = CRUDMerchant.create(db, merchant_in, user_id=me.id)
    return m


@router.get("/")
def read_many(db: DBSession, me: CurrentUser) -> Iterable[MerchantApiOut]:
    return CRUDMerchant.read_many(db, user_id=me.id)


@router.put("/{merchant_id}")
def update(
    db: DBSession, me: CurrentUser, merchant_id: int, merchant_in: MerchantApiIn
) -> MerchantApiOut:
    CRUDMerchant.read(db, id=merchant_id, user_id=me.id)
    return CRUDMerchant.update(db, merchant_id, merchant_in)


@router.delete("/{merchant_id}")
def delete(db: DBSession, me: CurrentUser, merchant_id: int) -> int:
    CRUDMerchant.read(db, id=merchant_id, user_id=me.id)
    return CRUDMerchant.delete(db, merchant_id)
