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
from app.features.merchant.crud import CRUDMerchant
from app.features.merchant.models import MerchantApiIn, MerchantApiOut
from app.features.user.crud import CRUDUser
from app.features.user.deps import CurrentUser


router = APIRouter()


@router.post("/")
def create(
    db: DBSession, me: CurrentUser, merchant_in: MerchantApiIn
) -> MerchantApiOut:
    m = CRUDMerchant.create(db, merchant_in, user_id=me.id)
    return m


@router.get("/")
def read_many(db: DBSession, me: CurrentUser) -> Iterable[MerchantApiOut]:
    return CRUDUser.read_merchants(db, me.id)


@router.get("/{merchant_id}")
def read(db: DBSession, me: CurrentUser, merchant_id: int) -> MerchantApiOut:
    return CRUDUser.read_merchant(db, me.id, merchant_id=merchant_id)


@router.put("/{merchant_id}")
def update(
    db: DBSession, me: CurrentUser, merchant_id: int, merchant_in: MerchantApiIn
) -> MerchantApiOut:
    CRUDUser.read_merchant(db, me.id, merchant_id)
    return CRUDMerchant.update(db, merchant_id, merchant_in)


@router.delete("/{merchant_id}")
def delete(db: DBSession, me: CurrentUser, merchant_id: int) -> int:
    CRUDUser.read_merchant(db, me.id, merchant_id)
    return CRUDMerchant.delete(db, merchant_id)
