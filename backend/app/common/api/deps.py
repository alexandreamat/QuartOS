from typing import Generator, Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from app.db.session import SessionLocal
from app.core import security
from app.core.config import settings
from app.features.user.crud import CRUDUser
from app.features.user.schemas import UserRead
from app.features.auth.schemas import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_STR}/login")


def get_db() -> Generator[Session, None, None]:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> UserRead:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    try:
        user = CRUDUser.read(db, id=token_data.sub)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


def get_current_superuser(
    current_user: UserRead = Depends(get_current_user),
) -> UserRead:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user doesn't have enough privileges",
        )
    return current_user


DBSession = Annotated[Session, Depends(get_db)]
CurrentSuperuser = Annotated[UserRead, Depends(get_current_superuser)]
CurrentUser = Annotated[UserRead, Depends(get_current_user)]
