from typing import Iterable

from fastapi import APIRouter

from app.database.deps import DBSession
from app.features.user import CRUDUser, CurrentUser
from app.features.account import AccountApiOut

router = APIRouter()


@router.get("/")
def read_many(db: DBSession, current_user: CurrentUser) -> Iterable[AccountApiOut]:
    return CRUDUser.read_accounts(db, current_user.id)
