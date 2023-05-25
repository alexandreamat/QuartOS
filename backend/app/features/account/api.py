from fastapi import APIRouter, HTTPException, status

from sqlalchemy.exc import NoResultFound

from app.features.user.deps import CurrentUser
from app.database.deps import DBSession

from app.features.userinstitutionlink.crud import CRUDUserInstitutionLink

from .crud import CRUDAccount
from .schemas import AccountRead, AccountWrite

router = APIRouter()


@router.post("/")
def create(
    db: DBSession,
    current_user: CurrentUser,
    account: AccountWrite,
) -> AccountRead:
    try:
        user = CRUDUserInstitutionLink.read_user(db, account.user_institution_link_id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)
    return CRUDAccount.create(db, account)


@router.get("/{id}")
def read(db: DBSession, current_user: CurrentUser, id: int) -> AccountRead:
    try:
        account = CRUDAccount.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if CRUDAccount.read_user(db, account.id).id != current_user.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)
    return account


@router.get("/")
def read_many(db: DBSession, current_user: CurrentUser) -> list[AccountRead]:
    return CRUDAccount.read_many_by_user(db, current_user.id)


@router.put("/{id}")
def update(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    account: AccountWrite,
) -> AccountRead:
    try:
        user = CRUDAccount.read_user(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)
    try:
        user = CRUDUserInstitutionLink.read_user(db, account.user_institution_link_id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)
    return CRUDAccount.update(db, id, account)
