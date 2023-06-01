from sqlmodel import Session

from app.core.security import get_password_hash
from app.common.crud import CRUDBase

from .models import User, UserApiOut, UserApiIn


class CRUDUser(CRUDBase[User, UserApiOut, UserApiIn]):
    db_model = User
    api_out_model = UserApiOut

    @classmethod
    def create(cls, db: Session, new_schema_obj: UserApiIn) -> UserApiOut:
        hashed_password = get_password_hash(new_schema_obj.password)
        del new_schema_obj.password
        db_obj_in = cls.db_obj_from_schema(new_schema_obj)
        db_obj_in.hashed_password = hashed_password
        db_obj_out = User.create_or_update(db, db_obj_in)
        return cls.api_out_model.from_orm(db_obj_out)

    @classmethod
    def read_by_email(cls, db: Session, email: str) -> UserApiOut:
        return UserApiOut.from_orm(User.read_by_email(db, email=email))

    @classmethod
    def update(cls, db: Session, id: int, new_schema_obj: UserApiIn) -> UserApiOut:
        hashed_password = get_password_hash(new_schema_obj.password)
        del new_schema_obj.password
        db_obj_in = cls.db_obj_from_schema(new_schema_obj)
        db_obj_in.hashed_password = hashed_password
        db_obj_out = User.update(db, id, db_obj_in)
        return UserApiOut.from_orm(db_obj_out)

    @classmethod
    def authenticate(cls, db: Session, email: str, password: str) -> UserApiOut:
        return UserApiOut.from_orm(User.authenticate(db, email, password))
