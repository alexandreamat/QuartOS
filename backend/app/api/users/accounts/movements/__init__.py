from typing import Iterable

from fastapi import APIRouter, HTTPException, status

from app.database.deps import DBSession

from app.features.user import CurrentUser, CRUDUser
from app.features.account import CRUDAccount
from app.features.movement import CRUDMovement, MovementApiOut
from app.features.transaction import TransactionApiIn

from . import transactions

router = APIRouter()


@router.post("/")
def create_many(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    transactions: list[TransactionApiIn],
    transaction_ids: list[int],
) -> Iterable[MovementApiOut]:
    CRUDUser.read_account(db, me.id, None, account_id)
    for transaction_id in transaction_ids:
        CRUDUser.read_transaction(db, me.id, None, account_id, None, transaction_id)
    yield from CRUDAccount.create_many_movements(
        db, account_id, transactions, transaction_ids
    )


router.include_router(
    transactions.router,
    prefix="/{movement_id}/transactions",
    tags=["transactions"],
)
