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

from . import movements
from . import transactions
from . import institutionlinks

router = APIRouter()


@router.post("/signup")
def signup(db: DBSession, user: UserApiIn) -> UserApiOut:
    """
    Create new user without the need to be logged in.
    """
    user.is_superuser = False
    try:
        user_out = CRUDUser.create(db, new_schema_obj=user)
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT)
    return user_out


@router.get("/me")
def read_me(db: DBSession, current_user: CurrentUser) -> UserApiOut:
    """
    Get current user.
    """
    return current_user


@router.put("/me")
def update_me(db: DBSession, current_user: CurrentUser, user: UserApiIn) -> UserApiOut:
    """
    Update own user.
    """
    return CRUDUser.update(db, id=current_user.id, new_obj=user)


@router.get("/{user_id}")
def read(db: DBSession, user_id: int, current_user: CurrentSuperuser) -> UserApiOut:
    """
    Get a specific user by id.
    """
    return CRUDUser.read(db, id=user_id)


@router.put("/{user_id}")
def update(
    db: DBSession, current_user: CurrentSuperuser, user_id: int, user: UserApiIn
) -> UserApiOut:
    """
    Update a user.
    """
    return CRUDUser.update(db, id=user_id, new_obj=user)


@router.post("/")
def create(
    db: DBSession, current_user: CurrentSuperuser, user: UserApiIn
) -> UserApiOut:
    """
    Create new user.
    """
    try:
        user_out = CRUDUser.create(db, new_schema_obj=user)
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT)
    return user_out


@router.get("/")
def read_many(
    db: DBSession,
    current_user: CurrentSuperuser,
    offset: int = 0,
    limit: int = 100,
) -> Iterable[UserApiOut]:
    """
    Retrieve users.
    """
    return CRUDUser.read_many(db, offset, limit)


@router.delete("/{user_id}")
def delete(db: DBSession, current_user: CurrentSuperuser, user_id: int) -> None:
    if current_user.id == user_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)
    CRUDUser.delete(db, user_id)


router.include_router(
    transactions.router, prefix="/{user_id}/transactions", tags=["transactions"]
)
router.include_router(
    institutionlinks.router,
    prefix="/{user_id}/institution-links",
    tags=["institution-links"],
)
router.include_router(
    movements.router, prefix="/{user_id}/movements", tags=["movements"]
)
