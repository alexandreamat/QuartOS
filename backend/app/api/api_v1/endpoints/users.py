from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, NoResultFound
from starlette import status
from pydantic import EmailStr

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("/me")
def read_user_me(
    db: Session = Depends(deps.get_db),
    current_user: schemas.UserRead = Depends(deps.get_current_user),
) -> schemas.UserRead:
    """
    Get current user.
    """
    return current_user


@router.put("/me")
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    current_user: schemas.UserRead = Depends(deps.get_current_user),
    user: schemas.UserUpdate,
) -> schemas.UserRead:
    """
    Update own user.
    """
    try:
        user_out = crud.user.update(db, id=current_user.id, new_schema_obj=user)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user with this username does not exist in the system",
        )
    return user_out


@router.get("/{id}")
def read_user_by_id(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_superuser),
) -> schemas.UserRead:
    """
    Get a specific user by id.
    """
    try:
        return crud.user.read(db, id=id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user with this username does not exist in the system",
        )


@router.put("/{id}")
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_superuser),
    id: int,
    user: schemas.UserUpdate,
) -> schemas.UserRead:
    """
    Update a user.
    """
    try:
        user_out = crud.user.update(db, id=id, new_schema_obj=user)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user with this username does not exist in the system",
        )
    return user_out


@router.post("/")
def create(
    *,
    db: Session = Depends(deps.get_db),
    user: schemas.UserCreate,
    current_user: models.User = Depends(deps.get_current_superuser),
) -> schemas.UserRead:
    """
    Create new user.
    """
    try:
        user_out = crud.user.create(db, new_schema_obj=user)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail="The user with this username already exists in the system.",
        )
    return user_out


@router.get("/")
def read_users(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_superuser),
    skip: int = 0,
    limit: int = 100,
) -> list[schemas.UserRead]:
    """
    Retrieve users.
    """
    users = crud.user.read_multi(db, skip=skip, limit=limit)
    return users


@router.post("/open")
def create_user_open(
    *,
    db: Session = Depends(deps.get_db),
    user: schemas.UserCreate,
) -> schemas.UserRead:
    """
    Create new user without the need to be logged in.
    """
    try:
        user_out = crud.user.create(db, new_schema_obj=user)
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system",
        )
    return user_out
