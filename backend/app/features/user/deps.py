from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.exc import NoResultFound

from app.database.deps import DBSession
from app.utils import ALGORITHM
from app.settings import settings

from .crud import CRUDUser

from app.features.auth.models import TokenPayload

from .models import UserApiOut

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_STR}/auth/login")


def get_current_user(
    db: DBSession, token: str = Depends(reusable_oauth2)
) -> UserApiOut:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        token_data = TokenPayload(**payload)
    except (jwt.JWTError, ValidationError):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    try:
        user = CRUDUser.read(db, id=token_data.sub)
    except NoResultFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return user


CurrentUser = Annotated[UserApiOut, Depends(get_current_user)]


def get_current_superuser(current_user: CurrentUser) -> UserApiOut:
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return current_user


CurrentSuperuser = Annotated[UserApiOut, Depends(get_current_superuser)]
