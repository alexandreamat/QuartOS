from sqlalchemy.orm import Session

from app import models, schemas

from app.core.security import get_password_hash


def create(db: Session, new_schema_obj: schemas.UserWrite) -> schemas.UserRead:
    hashed_password = get_password_hash(new_schema_obj.password)
    del new_schema_obj.password
    db_obj_in = models.User.from_schema(new_schema_obj)
    db_obj_in.hashed_password = hashed_password
    db_obj_out = models.User.create_or_update(db, db_obj_in)
    return schemas.UserRead.from_orm(db_obj_out)


def read(db: Session, id: int) -> schemas.UserRead:
    return schemas.UserRead.from_orm(models.User.read(db, id))


def read_many(db: Session, skip: int = 0, limit: int = 100) -> list[schemas.UserRead]:
    return [
        schemas.UserRead.from_orm(s) for s in models.User.read_many(db, skip, limit)
    ]


def read_by_email(db: Session, email: str) -> schemas.UserRead:
    return schemas.UserRead.from_orm(models.User.read_by_email(db, email=email))


def update(db: Session, id: int, new_schema_obj: schemas.UserWrite) -> schemas.UserRead:
    db_obj_in = models.User.from_schema(new_schema_obj)
    db_obj_in.hashed_password = get_password_hash(new_schema_obj.password)
    db_obj_out = models.User.update(db, id, db_obj_in)
    return schemas.UserRead.from_orm(db_obj_out)


def authenticate(db: Session, email: str, password: str) -> schemas.UserRead:
    return schemas.UserRead.from_orm(models.User.authenticate(db, email, password))
