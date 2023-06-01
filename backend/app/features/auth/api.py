from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import NoResultFound
from jose.exceptions import JWTError

from app.core import security
from app.core.config import settings
from app.utils import (
    generate_password_reset_token,
    send_reset_password_email,
    verify_password_reset_token,
)
from app.database.deps import DBSession
from app.features.user.crud import CRUDUser
from app.features.user.models import UserApiIn

from .models import Token

router = APIRouter()


@router.post("/login")
def login(db: DBSession, form_data: OAuth2PasswordRequestForm = Depends()) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    try:
        user = CRUDUser.authenticate(
            db, email=form_data.username, password=form_data.password
        )
    except NoResultFound:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=security.create_access_token(
            str(user.id), expires_delta=access_token_expires
        ),
        token_type="bearer",
    )


@router.post("/recover-password/{email}")
def recover(email: str, db: DBSession) -> None:
    """
    Password Recovery
    """
    try:
        user = CRUDUser.read_by_email(db, email=email)
    except NoResultFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    password_reset_token = generate_password_reset_token(email=email)
    send_reset_password_email(
        email_to=user.email, email=email, token=password_reset_token
    )


@router.post("/reset-password/")
def reset(
    db: DBSession,
    token: Annotated[str, Body(...)],
    new_password: Annotated[str, Body(...)],
) -> None:
    """
    Reset password
    """
    try:
        email = verify_password_reset_token(token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    try:
        curr_user = CRUDUser.read_by_email(db, email=email)
    except NoResultFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    user_in = UserApiIn(**curr_user.dict(), password=new_password)
    CRUDUser.update(db, curr_user.id, user_in)
