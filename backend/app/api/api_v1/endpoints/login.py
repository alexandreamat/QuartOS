from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from starlette import status
from jose.exceptions import JWTError

from app import crud, models, schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.core.security import get_password_hash
from app.utils import (
    generate_password_reset_token,
    send_reset_password_email,
    verify_password_reset_token,
)

router = APIRouter()


@router.post("/login/access-token")
def login_access_token(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> schemas.Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    try:
        user = crud.user.authenticate(
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


@router.post("/login/test-token")
def test_token(
    current_user: schemas.UserRead = Depends(deps.get_current_user),
) -> schemas.UserRead:
    """
    Test access token
    """
    return current_user


@router.post("/password-recovery/{email}")
def recover_password(
    email: str,
    db: Session = Depends(deps.get_db),
) -> schemas.Msg:
    """
    Password Recovery
    """
    try:
        user = crud.user.read_by_email(db, email=email)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_BAD_REQUEST,
            detail="The user with this username does not exist in the system.",
        )
    password_reset_token = generate_password_reset_token(email=email)
    send_reset_password_email(
        email_to=user.email, email=email, token=password_reset_token
    )
    return schemas.Msg(msg="Password recovery email sent")


@router.post("/reset-password/")
def reset_password(
    token: Annotated[str, Body(...)],
    new_password: Annotated[str, Body(...)],
    db: Session = Depends(deps.get_db),
) -> schemas.Msg:
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
        curr_user = crud.user.read_by_email(db, email=email)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user with this username does not exist in the system.",
        )
    user_in = schemas.UserUpdate(**curr_user.dict(), password=new_password)
    crud.user.update(db, curr_user.id, user_in)
    return schemas.Msg(msg="Password updated successfully")
