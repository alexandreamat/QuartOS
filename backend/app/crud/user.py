from typing import Any, Dict, Optional, Union

from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from app.core.security import get_password_hash, verify_password
from app.crud.base import CRUDBase
from app import models, schemas

from app import schemas, models
from app.schemas.user import UserCreate, UserRead
from app.core.security import get_password_hash


class CRUDUser(
    CRUDBase[
        models.User,
        schemas.UserCreate,
        schemas.UserRead,
        schemas.UserUpdate,
    ]
):
    def create(self, db: Session, *, new_schema_obj: UserCreate) -> UserRead:
        hashed_password = get_password_hash(new_schema_obj.password)
        del new_schema_obj.password
        db_user = models.User(**new_schema_obj.dict(), hashed_password=hashed_password)
        return self._insert_or_update(db, db_user)

    def _select_by_email(self, db: Session, *, email: str) -> models.User:
        db_user = db.query(models.User).filter(models.User.email == email).first()
        if not db_user:
            raise NoResultFound
        return db_user

    def read_by_email(self, db: Session, *, email: str) -> schemas.UserRead:
        return schemas.UserRead.from_orm(self._select_by_email(db, email=email))

    def update(
        self, db: Session, id: int, new_schema_obj: schemas.UserUpdate
    ) -> schemas.UserRead:
        db_user = self._select(db, id)
        db_user.hashed_password = get_password_hash(new_schema_obj.password)
        del new_schema_obj.password
        for key, value in new_schema_obj.dict(exclude_unset=True).items():
            setattr(db_user, key, value)
        return self._insert_or_update(db, db_user)

    def authenticate(
        self, db: Session, *, email: str, password: str
    ) -> schemas.UserRead:
        db_user = self._select_by_email(db, email=email)
        verify_password(password, db_user.hashed_password)
        return schemas.UserRead.from_orm(db_user)


user = CRUDUser(models.User, schemas.UserRead)
