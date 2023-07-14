from typing import Iterable

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import NoResultFound

from app.database.deps import DBSession
from app.features.user import CurrentSuperuser
from app.api import api_router

from .crud import CRUDTransactionDeserialiser
from .models import TransactionDeserialiserApiIn, TransactionDeserialiserApiOut

TRANSACTION_DESERIALISERS = "transaction-deserialisers"

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
    try:
        return CRUDTransactionDeserialiser.read(db, id=id)
    except NoResultFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


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
    try:
        return CRUDTransactionDeserialiser.update(db, id, institution)
    except NoResultFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


@router.delete("/{id}")
def delete(db: DBSession, current_user: CurrentSuperuser, id: int) -> None:
    """
    Delete a deserialiser.
    """
    try:
        CRUDTransactionDeserialiser.delete(db, id=id)
    except NoResultFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


api_router.include_router(
    router,
    prefix=f"/{TRANSACTION_DESERIALISERS}",
    tags=[TRANSACTION_DESERIALISERS],
)
