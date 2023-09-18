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
