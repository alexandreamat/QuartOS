from sqlmodel import Session

from app.core.security import get_password_hash
from app.common.crud import CRUDBase

from .models import User, UserRead, UserWrite


class CRUDUser(CRUDBase[User, UserRead, UserWrite]):
    db_model_type = User
    read_model_type = UserRead
    write_model_type = UserWrite

    @classmethod
    def create(cls, db: Session, new_schema_obj: UserWrite) -> UserRead:
        hashed_password = get_password_hash(new_schema_obj.password)
        del new_schema_obj.password
        db_obj_in = cls.db_obj_from_schema(new_schema_obj)
        db_obj_in.hashed_password = hashed_password
        db_obj_out = User.create_or_update(db, db_obj_in)
        return cls.read_model_type.from_orm(db_obj_out)

    @classmethod
    def read_by_email(cls, db: Session, email: str) -> UserRead:
        return UserRead.from_orm(User.read_by_email(db, email=email))

    @classmethod
    def update(cls, db: Session, id: int, new_schema_obj: UserWrite) -> UserRead:
        hashed_password = get_password_hash(new_schema_obj.password)
        del new_schema_obj.password
        db_obj_in = cls.db_obj_from_schema(new_schema_obj)
        db_obj_in.hashed_password = hashed_password
        db_obj_out = User.update(db, id, db_obj_in)
        return UserRead.from_orm(db_obj_out)

    @classmethod
    def authenticate(cls, db: Session, email: str, password: str) -> UserRead:
        return UserRead.from_orm(User.authenticate(db, email, password))
