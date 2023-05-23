from sqlalchemy.orm import Session

from app import models, schemas

from app.core.security import get_password_hash

from .base import CRUDBase


class CRUDUser(CRUDBase[models.User, schemas.UserRead, schemas.UserWrite]):
    model_type = models.User
    read_schema_type = schemas.UserRead
    write_schema_type = schemas.UserWrite

    @classmethod
    def create(cls, db: Session, new_schema_obj: schemas.UserWrite) -> schemas.UserRead:
        hashed_password = get_password_hash(new_schema_obj.password)
        del new_schema_obj.password
        db_obj_in = models.User.from_schema(new_schema_obj)
        db_obj_in.hashed_password = hashed_password
        db_obj_out = models.User.create_or_update(db, db_obj_in)
        return cls.read_schema_type.from_orm(db_obj_out)

    @classmethod
    def read_by_email(cls, db: Session, email: str) -> schemas.UserRead:
        return schemas.UserRead.from_orm(models.User.read_by_email(db, email=email))

    @classmethod
    def update(
        cls, db: Session, id: int, new_schema_obj: schemas.UserWrite
    ) -> schemas.UserRead:
        db_obj_in = models.User.from_schema(new_schema_obj)
        db_obj_in.hashed_password = get_password_hash(new_schema_obj.password)
        db_obj_out = models.User.update(db, id, db_obj_in)
        return schemas.UserRead.from_orm(db_obj_out)

    @classmethod
    def authenticate(cls, db: Session, email: str, password: str) -> schemas.UserRead:
        return schemas.UserRead.from_orm(models.User.authenticate(db, email, password))
