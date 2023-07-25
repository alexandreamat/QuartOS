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
    current_user: CurrentSuperuser,
    institution: TransactionDeserialiserApiIn,
) -> TransactionDeserialiserApiOut:
    """
    Create new deserialiser.
    """
    return CRUDTransactionDeserialiser.create(db, institution)


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
    current_user: CurrentSuperuser,
    id: int,
    institution: TransactionDeserialiserApiIn,
) -> TransactionDeserialiserApiOut:
    """
    Update a deserialiser.
    """
    return CRUDTransactionDeserialiser.update(db, id, institution)


@router.delete("/{id}")
def delete(db: DBSession, current_user: CurrentSuperuser, id: int) -> None:
    """
    Delete a deserialiser.
    """
    CRUDTransactionDeserialiser.delete(db, id=id)
