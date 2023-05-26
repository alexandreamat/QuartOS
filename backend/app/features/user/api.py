from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import IntegrityError, NoResultFound

from app.database.deps import DBSession

from .deps import CurrentUser, CurrentSuperuser
from .crud import CRUDUser
from .models import UserRead, UserWrite

router = APIRouter()


@router.post("/signup")
def signup(db: DBSession, user: UserWrite) -> UserRead:
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
def read_me(db: DBSession, current_user: CurrentUser) -> UserRead:
    """
    Get current user.
    """
    return current_user


@router.put("/me")
def update_me(db: DBSession, current_user: CurrentUser, user: UserWrite) -> UserRead:
    """
    Update own user.
    """
    return CRUDUser.update(db, id=current_user.id, new_schema_obj=user)


@router.get("/{id}")
def read(id: int, db: DBSession, current_user: CurrentSuperuser) -> UserRead:
    """
    Get a specific user by id.
    """
    try:
        return CRUDUser.read(db, id=id)
    except NoResultFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


@router.put("/{id}")
def update(
    db: DBSession, current_user: CurrentSuperuser, id: int, user: UserWrite
) -> UserRead:
    """
    Update a user.
    """
    try:
        user_out = CRUDUser.update(db, id=id, new_schema_obj=user)
    except NoResultFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return user_out


@router.post("/")
def create(db: DBSession, current_user: CurrentSuperuser, user: UserWrite) -> UserRead:
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
    skip: int = 0,
    limit: int = 100,
) -> list[UserRead]:
    """
    Retrieve users.
    """
    return CRUDUser.read_many(db, skip=skip, limit=limit)


@router.delete("/{id}")
def delete(db: DBSession, current_user: CurrentSuperuser, id: int) -> None:
    if current_user.id == id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)
    CRUDUser.delete(db, id)
