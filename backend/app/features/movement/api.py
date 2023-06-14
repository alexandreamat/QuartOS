from __future__ import annotations

from fastapi import APIRouter


from app.features.user.deps import CurrentUser
from app.database.deps import DBSession


from .models import MovementApiOut
from .crud import CRUDMovement

# forward references, only for annotations
from app.features.transaction.models import TransactionApiOut

router = APIRouter()


@router.get("/")
def read_many(
    db: DBSession,
    current_user: CurrentUser,
    page: int = 1,
    per_page: int = 0,
    search: str | None = None,
) -> list[MovementApiOut]:
    return CRUDMovement.read_many_by_user(db, current_user.id, page, per_page, search)


@router.get("/{id}/transactions")
def read_transactions(db: DBSession, id: int) -> list[TransactionApiOut]:
    from app.features import transaction

    return transaction.crud.CRUDTransaction.read_many_by_movement(db, id)


@router.delete("/{id}")
def delete(db: DBSession, id: int) -> None:
    CRUDMovement.delete(db, id)
