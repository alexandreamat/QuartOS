from typing import Iterable

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.database.deps import DBSession

from app.features.user import (
    CurrentUser,
    CurrentSuperuser,
    CRUDUser,
    UserApiOut,
    UserApiIn,
)

from . import institutionlinks
from . import accounts
from . import movements
from . import transactions

router = APIRouter()


@router.post("/signup")
def signup(db: DBSession, user_in: UserApiIn) -> UserApiOut:
    """
    Create new user without the need to be logged in.
    """
    user_in.is_superuser = False
    try:
        user_out = CRUDUser.create(db, obj_in=user_in)
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT)
    return user_out


@router.get("/me")
def read_me(db: DBSession, me: CurrentUser) -> UserApiOut:
    """
    Get current user.
    """
    return me


@router.put("/me")
def update_me(db: DBSession, me: CurrentUser, user_in: UserApiIn) -> UserApiOut:
    """
    Update own user.
    """
    return CRUDUser.update(db, me.id, user_in)


@router.get("/{user_id}")
def read(db: DBSession, me: CurrentSuperuser, user_id: int) -> UserApiOut:
    """
    Get a specific user by id.
    """
    return CRUDUser.read(db, user_id)


@router.put("/{user_id}")
def update(
    db: DBSession, me: CurrentSuperuser, user_id: int, user_in: UserApiIn
) -> UserApiOut:
    """
    Update a user.
    """
    return CRUDUser.update(db, user_id, user_in)


@router.post("/")
def create(db: DBSession, me: CurrentSuperuser, user_in: UserApiIn) -> UserApiOut:
    """
    Create new user.
    """
    try:
        user_out = CRUDUser.create(db, obj_in=user_in)
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT)
    return user_out


@router.get("/")
def read_many(
    db: DBSession,
    me: CurrentSuperuser,
    offset: int = 0,
    limit: int = 100,
) -> Iterable[UserApiOut]:
    """
    Retrieve users.
    """
    return CRUDUser.read_many(db, offset, limit)


@router.delete("/{user_id}")
def delete(db: DBSession, me: CurrentSuperuser, user_id: int) -> None:
    if me.id == user_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)
    CRUDUser.delete(db, user_id)


router.include_router(
    institutionlinks.router,
    prefix="/me/institution-links",
    tags=["institution-links"],
)
router.include_router(movements.router, prefix="/me/movements", tags=["movements"])
router.include_router(
    transactions.router, prefix="/me/transactions", tags=["transactions"]
)
router.include_router(accounts.router, prefix="/me/accounts", tags=["accounts"])
