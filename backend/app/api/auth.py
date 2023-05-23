from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import NoResultFound
from jose.exceptions import JWTError

from app import schemas
from app.crud.user import CRUDUser
from app.core import security
from app.core.config import settings
from app.utils import (
    generate_password_reset_token,
    send_reset_password_email,
    verify_password_reset_token,
)

from . import deps

router = APIRouter()


@router.post("/login")
def login(
    db: deps.DBSession, form_data: OAuth2PasswordRequestForm = Depends()
) -> schemas.Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    try:
        user = CRUDUser.authenticate(
            db, email=form_data.username, password=form_data.password
        )
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return schemas.Token(
        access_token=security.create_access_token(
            str(user.id), expires_delta=access_token_expires
        ),
        token_type="bearer",
    )


@router.post("/recover-password/{email}")
def recover(email: str, db: deps.DBSession) -> None:
    """
    Password Recovery
    """
    try:
        user = CRUDUser.read_by_email(db, email=email)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_BAD_REQUEST,
            detail="The user with this username does not exist in the system.",
        )
    password_reset_token = generate_password_reset_token(email=email)
    send_reset_password_email(
        email_to=user.email, email=email, token=password_reset_token
    )


@router.post("/reset-password/")
def reset(
    db: deps.DBSession,
    token: Annotated[str, Body(...)],
    new_password: Annotated[str, Body(...)],
) -> None:
    """
    Reset password
    """
    try:
        email = verify_password_reset_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token"
        )
    try:
        curr_user = CRUDUser.read_by_email(db, email=email)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user with this username does not exist in the system.",
        )
    user_in = schemas.UserWrite(**curr_user.dict(), password=new_password)
    CRUDUser.update(db, curr_user.id, user_in)
