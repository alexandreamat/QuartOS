from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from app import models, schemas

from app.core.security import get_password_hash, verify_password
from app.core.security import get_password_hash


def _insert_or_update(db: Session, db_obj: models.User) -> models.User:
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def _select(db: Session, id: int) -> models.User:
    db_obj = db.get(models.User, id)
    if not db_obj:
        raise NoResultFound
    return db_obj


def _schema_to_db(schema_obj: schemas.UserCreate, hashed_password: str) -> models.User:
    return models.User(**schema_obj.dict(), hashed_password=hashed_password)


def _db_to_schema(db_obj: models.User) -> schemas.UserRead:
    return schemas.UserRead.from_orm(db_obj)


def _select_by_email(db: Session, email: str) -> models.User:
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if not db_user:
        raise NoResultFound
    return db_user


def create(db: Session, new_schema_obj: schemas.UserCreate) -> schemas.UserRead:
    hashed_password = get_password_hash(new_schema_obj.password)
    del new_schema_obj.password
    db_user_in = _schema_to_db(new_schema_obj, hashed_password)
    db_user_out = _insert_or_update(db, db_user_in)
    return _db_to_schema(db_user_out)


def read(db: Session, id: int) -> schemas.UserRead:
    return _db_to_schema(_select(db, id))


def read_multi(db: Session, skip: int = 0, limit: int = 100) -> list[schemas.UserRead]:
    return [
        _db_to_schema(s) for s in db.query(models.User).offset(skip).limit(limit).all()
    ]


def read_by_email(db: Session, email: str) -> schemas.UserRead:
    return _db_to_schema(_select_by_email(db, email=email))


def update(
    db: Session, id: int, new_schema_obj: schemas.UserUpdate
) -> schemas.UserRead:
    db_user_in = _select(db, id)
    db_user_in.hashed_password = get_password_hash(new_schema_obj.password)
    del new_schema_obj.password
    for key, value in new_schema_obj.dict(exclude_unset=True).items():
        setattr(db_user_in, key, value)
    db_user_out = _insert_or_update(db, db_user_in)
    return _db_to_schema(db_user_out)


def authenticate(db: Session, email: str, password: str) -> schemas.UserRead:
    db_user = _select_by_email(db, email=email)
    assert db_user.hashed_password
    verify_password(password, db_user.hashed_password)
    return _db_to_schema(db_user)
