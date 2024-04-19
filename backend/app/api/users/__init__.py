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

from typing import Annotated, Iterable, cast

from fastapi import APIRouter, Body, HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.crud.user import CRUDUser
from app.database.deps import DBSession
from app.deps.user import CurrentSuperuser, CurrentUser
from app.recaptcha import ReCaptchaException, create_recaptcha_assessment
from app.schemas.user import (
    DefaultUserApiIn,
    DefaultUserApiOut,
    UserApiIn,
    UserApiOut,
)
from app.utils import include_package_routes

router = APIRouter()


@router.post("/signup")
def signup(
    db: DBSession, user_in: DefaultUserApiIn, recaptcha_token: Annotated[str, Body()]
) -> DefaultUserApiOut:
    """
    Create new user without the need to be logged in.
    """
    user_in.type = "defaultuser"
    try:
        create_recaptcha_assessment(recaptcha_token, "SIGNUP")
    except ReCaptchaException as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail=str(e))
    try:
        user_out = cast(DefaultUserApiOut, CRUDUser.create(db, obj_in=user_in))
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
def update_me(
    db: DBSession, me: CurrentUser, user_in: DefaultUserApiIn
) -> DefaultUserApiOut:
    """
    Update own user.
    """
    return CRUDUser.update(db, me.id, user_in)


@router.get("/{user_id}")
def read(db: DBSession, me: CurrentSuperuser, user_id: int) -> UserApiOut:
    """
    Get a specific user by id.
    """
    return CRUDUser.read(db, id=user_id)


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
    page: int = 0,
    per_page: int = 0,
) -> Iterable[UserApiOut]:
    """
    Retrieve users.
    """
    return CRUDUser.read_many(db, page=page, per_page=per_page)


@router.delete("/{user_id}")
def delete(db: DBSession, me: CurrentSuperuser, user_id: int) -> int:
    if me.id == user_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)
    return CRUDUser.delete(db, user_id)


include_package_routes(router, __name__, __path__, "/me")
