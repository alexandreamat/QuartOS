from typing import Iterable

from fastapi import APIRouter, HTTPException, status

from app.database.deps import DBSession

from app.features.user import CurrentUser, CRUDUser
from app.features.account import CRUDAccount
from app.features.transaction import TransactionApiIn

from app.features.movement import (
    MovementApiOut,
    CRUDMovement,
)

from . import transactions

router = APIRouter()


@router.post("/")
def create_many(
    db: DBSession,
    me: CurrentUser,
    userinstitutionlink_id: int,
    account_id: int,
    transactions: list[TransactionApiIn],
    transaction_ids: list[int],
) -> Iterable[MovementApiOut]:
    CRUDUser.read_account(db, me.id, userinstitutionlink_id, account_id)
    if CRUDAccount.is_synced(db, account_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    for transaction in transactions:
        yield CRUDAccount.create_movement(db, account_id, transaction)
    for transaction_id in transaction_ids:
        CRUDUser.read_transaction(
            db, me.id, userinstitutionlink_id, account_id, None, transaction_id
        )
        yield CRUDAccount.create_movement(db, account_id, transaction_id)


@router.delete("/{movement_id}")
def delete(
    db: DBSession,
    me: CurrentUser,
    userinstitutionlink_id: int,
    account_id: int,
    movement_id: int,
) -> None:
    CRUDUser.read_movement(db, me.id, userinstitutionlink_id, account_id, movement_id)
    CRUDMovement.delete(db, movement_id)


router.include_router(
    transactions.router,
    prefix="/{movement_id}/transactions",
    tags=["transactions"],
)
