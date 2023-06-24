from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import NoResultFound

from app.features.user.deps import CurrentUser
from app.database.deps import DBSession


from .models import MovementApiOut, MovementApiIn
from .crud import CRUDMovement

# forward references, only for annotations
from app.features.transaction.models import TransactionApiOut

router = APIRouter()


@router.get("/{id}/transactions")
def read_transactions(
    db: DBSession, current_user: CurrentUser, id: int
) -> list[TransactionApiOut]:
    from app.features import transaction

    try:
        movement = CRUDMovement.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    u = CRUDMovement.read_user(db, movement.id)
    if u.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return transaction.crud.CRUDTransaction.read_many_by_movement(db, id)


@router.get("/{id}")
def read(db: DBSession, current_user: CurrentUser, id: int) -> MovementApiOut:
    try:
        movement = CRUDMovement.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    u = CRUDMovement.read_user(db, movement.id)
    if u.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return movement


@router.patch("/{id}")
def update(
    db: DBSession, current_user: CurrentUser, id: int, transaction_ids: list[int]
) -> MovementApiOut:
    from app.features.transaction.crud import CRUDTransaction
    from app.features.transaction.models import TransactionApiIn

    try:
        movement = CRUDMovement.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Movement not found")
    if CRUDMovement.read_user(db, movement.id).id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)

    # Unlink existing transactions
    for movement_transaction in CRUDTransaction.read_many_by_movement(db, id):
        transaction_in = TransactionApiIn(
            **movement_transaction.dict(exclude={"movement_id"})
        )
        CRUDTransaction.update(db, movement_transaction.id, transaction_in)

    # Link new transactions
    for transaction_id in transaction_ids:
        try:
            user = CRUDTransaction.read_user(db, transaction_id)
        except NoResultFound:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "Transaction ID not found: %d" % transaction_id,
            )
        if user.id != current_user.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN)
        transaction_db = CRUDTransaction.read(db, transaction_id)
        if transaction_db.movement_id:
            raise HTTPException(status.HTTP_400_BAD_REQUEST)
        transaction_in = TransactionApiIn(
            **transaction_db.dict(exclude_none=True), movement_id=movement.id
        )
        CRUDTransaction.update(db, transaction_db.id, transaction_in)

    return movement


@router.delete("/{id}")
def delete(db: DBSession, current_user: CurrentUser, id: int) -> None:
    try:
        movement = CRUDMovement.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if CRUDMovement.read_user(db, movement.id).id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    CRUDMovement.delete(db, id)


@router.post("/", tags=["transactions"])
def create(
    db: DBSession, current_user: CurrentUser, transaction_ids: list[int]
) -> MovementApiOut:
    from app.features import transaction

    movement = CRUDMovement.create(db, MovementApiIn())
    for transaction_id in transaction_ids:
        try:
            user = transaction.crud.CRUDTransaction.read_user(db, transaction_id)
        except NoResultFound:
            raise HTTPException(status.HTTP_404_NOT_FOUND)
        if user.id != current_user.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN)
        transaction_db = transaction.crud.CRUDTransaction.read(db, transaction_id)
        if transaction_db.movement_id:
            raise HTTPException(status.HTTP_400_BAD_REQUEST)
        transaction_in = transaction.models.TransactionApiIn(
            **transaction_db.dict(exclude_none=True), movement_id=movement.id
        )
        transaction.crud.CRUDTransaction.update(db, transaction_db.id, transaction_in)

    return movement


@router.get("/")
def read_many(
    db: DBSession,
    current_user: CurrentUser,
    page: int = 1,
    per_page: int = 0,
    search: str | None = None,
) -> list[MovementApiOut]:
    return CRUDMovement.read_many_by_user(db, current_user.id, page, per_page, search)
