# Copyright (C) 2024 Alexandre Amat
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose.exceptions import JWTError
from sqlalchemy.exc import NoResultFound

from app import utils
from app.crud.user import CRUDUser
from app.database.deps import DBSession
from app.schemas.auth import Token
from app.schemas.user import UserApiIn
from app.settings import settings
from app.utils import (
    verify_password_reset_token,
)

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
        access_token=utils.create_access_token(
            str(user.id), expires_delta=access_token_expires
        ),
        token_type="bearer",
    )


# TODO: use this in the front end
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
        curr_user = CRUDUser.read(db, email__eq=email)
    except NoResultFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    user_in = UserApiIn(**curr_user.model_dump(), password=new_password)
    CRUDUser.update(db, curr_user.id, user_in)
