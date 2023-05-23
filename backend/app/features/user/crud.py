from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.common.crud import CRUDBase

from . import model, schemas


class CRUDUser(CRUDBase[model.User, schemas.UserRead, schemas.UserWrite]):
    model_type = model.User
    read_schema_type = schemas.UserRead
    write_schema_type = schemas.UserWrite

    @classmethod
    def create(cls, db: Session, new_schema_obj: schemas.UserWrite) -> schemas.UserRead:
        hashed_password = get_password_hash(new_schema_obj.password)
        del new_schema_obj.password
        db_obj_in = model.User.from_schema(new_schema_obj)
        db_obj_in.hashed_password = hashed_password
        db_obj_out = model.User.create_or_update(db, db_obj_in)
        return cls.read_schema_type.from_orm(db_obj_out)

    @classmethod
    def read_by_email(cls, db: Session, email: str) -> schemas.UserRead:
        return schemas.UserRead.from_orm(model.User.read_by_email(db, email=email))

    @classmethod
    def update(
        cls, db: Session, id: int, new_schema_obj: schemas.UserWrite
    ) -> schemas.UserRead:
        hashed_password = get_password_hash(new_schema_obj.password)
        del new_schema_obj.password
        db_obj_in = model.User.from_schema(new_schema_obj)
        db_obj_in.hashed_password = hashed_password
        db_obj_out = model.User.update(db, id, db_obj_in)
        return schemas.UserRead.from_orm(db_obj_out)

    @classmethod
    def authenticate(cls, db: Session, email: str, password: str) -> schemas.UserRead:
        return schemas.UserRead.from_orm(model.User.authenticate(db, email, password))
