from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import IntegrityError, NoResultFound

from app import schemas
from app.crud.user import CRUDUser

from . import deps

router = APIRouter()


@router.get("/me")
def read_me(db: deps.DBSession, current_user: deps.CurrentUser) -> schemas.UserRead:
    """
    Get current user.
    """
    return current_user


@router.put("/me")
def update_me(
    db: deps.DBSession, current_user: deps.CurrentUser, user: schemas.UserWrite
) -> schemas.UserRead:
    """
    Update own user.
    """
    try:
        user_out = CRUDUser.update(db, id=current_user.id, new_schema_obj=user)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user with this username does not exist in the system",
        )
    return user_out


@router.get("/{id}")
def read(
    id: int, db: deps.DBSession, current_user: deps.CurrentSuperuser
) -> schemas.UserRead:
    """
    Get a specific user by id.
    """
    try:
        return CRUDUser.read(db, id=id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user with this username does not exist in the system",
        )


@router.put("/{id}")
def update(
    db: deps.DBSession,
    current_user: deps.CurrentSuperuser,
    id: int,
    user: schemas.UserWrite,
) -> schemas.UserRead:
    """
    Update a user.
    """
    try:
        user_out = CRUDUser.update(db, id=id, new_schema_obj=user)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user with this username does not exist in the system",
        )
    return user_out


@router.post("/")
def create(
    db: deps.DBSession, current_user: deps.CurrentSuperuser, user: schemas.UserWrite
) -> schemas.UserRead:
    """
    Create new user.
    """
    try:
        user_out = CRUDUser.create(db, new_schema_obj=user)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail="The user with this username already exists in the system.",
        )
    return user_out


@router.get("/")
def read_many(
    db: deps.DBSession,
    current_user: deps.CurrentSuperuser,
    skip: int = 0,
    limit: int = 100,
) -> list[schemas.UserRead]:
    """
    Retrieve users.
    """
    return CRUDUser.read_many(db, skip=skip, limit=limit)


@router.post("/open")
def create_open(db: deps.DBSession, user: schemas.UserWrite) -> schemas.UserRead:
    """
    Create new user without the need to be logged in.
    """
    try:
        user_out = CRUDUser.create(db, new_schema_obj=user)
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system",
        )
    return user_out
