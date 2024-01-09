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
from app.features.user import CurrentSuperuser
from app.features.transactiondeserialiser import (
    CRUDTransactionDeserialiser,
    TransactionDeserialiserApiIn,
    TransactionDeserialiserApiOut,
)


router = APIRouter()


@router.post("/")
def create(
    db: DBSession,
    me: CurrentSuperuser,
    transaction_deserialiser_in: TransactionDeserialiserApiIn,
) -> TransactionDeserialiserApiOut:
    """
    Create new deserialiser.
    """
    return CRUDTransactionDeserialiser.create(db, transaction_deserialiser_in)


@router.get("/{id}")
def read(db: DBSession, id: int) -> TransactionDeserialiserApiOut:
    """
    Get deserialiser by ID.
    """
    return CRUDTransactionDeserialiser.read(db, id=id)


@router.get("/")
def read_many(db: DBSession) -> Iterable[TransactionDeserialiserApiOut]:
    """
    Retrieve deserialisers.
    """
    return CRUDTransactionDeserialiser.read_many(db, 0, 0)


@router.put("/{id}")
def update(
    db: DBSession,
    me: CurrentSuperuser,
    id: int,
    institution_in: TransactionDeserialiserApiIn,
) -> TransactionDeserialiserApiOut:
    """
    Update a deserialiser.
    """
    return CRUDTransactionDeserialiser.update(db, id, institution_in)


@router.delete("/{id}")
def delete(db: DBSession, me: CurrentSuperuser, id: int) -> int:
    """
    Delete a deserialiser.
    """
    return CRUDTransactionDeserialiser.delete(db, id=id)
