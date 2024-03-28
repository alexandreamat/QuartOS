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
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

from typing import Iterable

from fastapi import APIRouter

from app.crud.bucket import CRUDBucket
from app.database.deps import DBSession
from app.deps.user import CurrentUser
from app.schemas.bucket import BucketApiIn, BucketApiOut

router = APIRouter()


@router.post("/")
def create(db: DBSession, me: CurrentUser, bucket_in: BucketApiIn) -> BucketApiOut:
    m = CRUDBucket.create(db, bucket_in, user_id=me.id)
    return m


@router.get("/")
def read_many(db: DBSession, me: CurrentUser) -> Iterable[BucketApiOut]:
    return CRUDBucket.read_many(db, user_id=me.id)


@router.get("/{bucket_id}")
def read(db: DBSession, me: CurrentUser, bucket_id: int) -> BucketApiOut:
    return CRUDBucket.read(db, id=bucket_id, user_id=me.id)


@router.put("/{bucket_id}")
def update(
    db: DBSession, me: CurrentUser, bucket_id: int, bucket_in: BucketApiIn
) -> BucketApiOut:
    CRUDBucket.read(db, id=bucket_id, user_id=me.id)
    return CRUDBucket.update(db, bucket_id, bucket_in)


@router.delete("/{bucket_id}")
def delete(db: DBSession, me: CurrentUser, bucket_id: int) -> int:
    CRUDBucket.read(db, id=bucket_id, user_id=me.id)
    return CRUDBucket.delete(db, bucket_id)
