from fastapi import APIRouter, HTTPException, status

from app.database.deps import DBSession

from app.features.user import CurrentUser, CRUDUser
from app.features.account import CRUDAccount
from app.features.transaction import (
    TransactionApiOut,
    TransactionApiIn,
    CRUDTransaction,
)

router = APIRouter()


@router.post("/", tags=["transactions"])
def create(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    movement_id: int,
    transaction_in: TransactionApiIn,
) -> TransactionApiOut:
    # Check permissions on link, account, and movement
    CRUDUser.read_movement(db, me.id, None, account_id, movement_id)
    # Proceed with creation
    return CRUDAccount.create_transaction(db, account_id, movement_id, transaction_in)


@router.get("/{transaction_id}")
def read(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    movement_id: int,
    transaction_id: int,
) -> TransactionApiOut:
    transaction = CRUDUser.read_transaction(
        db, me.id, None, account_id, movement_id, transaction_id
    )
    return transaction


@router.put("/{transaction_id}")
def update(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    movement_id: int,
    transaction_id: int,
    transaction_in: TransactionApiIn,
    new_movement_id: int,
) -> TransactionApiOut:
    CRUDUser.read_transaction(db, me.id, None, account_id, movement_id, transaction_id)
    return CRUDAccount.update_transaction(
        db, account_id, movement_id, transaction_id, transaction_in, new_movement_id
    )


@router.delete("/{transaction_id}")
def delete(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    movement_id: int,
    transaction_id: int,
) -> None:
    CRUDUser.read_transaction(db, me.id, None, account_id, movement_id, transaction_id)
    if CRUDTransaction.is_synced(db, transaction_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)

    return CRUDAccount.delete_transaction(db, movement_id, account_id, transaction_id)
