from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.exc import NoResultFound

from app.database.session import DBSession
from app.core import security
from app.core.config import settings
from app.features.user.crud import CRUDUser
from app.features.user.schemas import UserRead
from app.features.auth.schemas import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_STR}/login")


def get_current_user(db: DBSession, token: str = Depends(reusable_oauth2)) -> UserRead:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.JWTError, ValidationError):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    try:
        user = CRUDUser.read(db, id=token_data.sub)
    except NoResultFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return user


CurrentUser = Annotated[UserRead, Depends(get_current_user)]


def get_current_superuser(current_user: CurrentUser) -> UserRead:
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return current_user


CurrentSuperuser = Annotated[UserRead, Depends(get_current_superuser)]
