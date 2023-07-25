from fastapi import APIRouter

from app.database.deps import DBSession
from app.features.user import CurrentSuperuser
from app.features.account import CRUDAccount

router = APIRouter()


@router.post("/update-balances")
def update_balances(db: DBSession, current_user: CurrentSuperuser) -> None:
    for account in CRUDAccount.read_many(db, 0, 0):
        CRUDAccount.update_balance(db, account.id)
