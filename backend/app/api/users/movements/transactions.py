from fastapi import APIRouter, HTTPException, status

from app.database.deps import DBSession

from app.features.account import CRUDAccount, ForbiddenAccount
from app.features.transaction import (
    TransactionApiOut,
    TransactionApiIn,
    CRUDTransaction,
)

from app.features.movement import (
    MovementApiOut,
    CRUDMovement,
)

from app.features.user import CurrentUser

from .utils import check_user

TRANSACTIONS = "transactions"

router = APIRouter()


@router.post("/", tags=[TRANSACTIONS])
def create(
    db: DBSession,
    current_user: CurrentUser,
    movement_id: int,
    account_id: int,
    transaction: TransactionApiIn,
) -> MovementApiOut:
    return CRUDMovement.add_transaction(db, movement_id, account_id, transaction)


@router.get("/{transaction_id}")
def read(
    db: DBSession, current_user: CurrentUser, transaction_id: int
) -> TransactionApiOut:
    transaction = CRUDTransaction.read(db, transaction_id)
    if CRUDTransaction.read_user_id(db, transaction.id) != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return transaction


@router.put("/{transaction_id}")
def update(
    db: DBSession,
    current_user: CurrentUser,
    movement_id: int,
    transaction_id: int,
    account_id: int,
    transaction: TransactionApiIn,
) -> TransactionApiOut:
    # Check movement ownership
    check_user(db, current_user.id, movement_id)

    # Check new account existence and ownership
    user_id = CRUDAccount.read_user_id(db, account_id)
    if user_id != current_user.id:
        raise ForbiddenAccount()

    return CRUDMovement.update_transaction(
        db, movement_id, transaction_id, account_id, transaction
    )


@router.delete("/{transaction_id}")
def delete(
    db: DBSession,
    current_user: CurrentUser,
    movement_id: int,
    account_id: int,
    transaction_id: int,
) -> None:
    check_user(db, current_user.id, movement_id)
    if CRUDTransaction.is_synced(db, transaction_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)

    return CRUDMovement.delete_transaction(db, movement_id, account_id, transaction_id)
