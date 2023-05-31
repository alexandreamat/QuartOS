from typing import TypeVar, Type, Any, Generator, Callable

import pycountry
from sqlmodel import Session, SQLModel, Field
from sqlalchemy.exc import NoResultFound
from fastapi.encoders import jsonable_encoder


ModelType = TypeVar("ModelType", bound="Base")


class Base(SQLModel):
    id: int = Field(primary_key=True)

    @classmethod
    def create_or_update(
        cls: Type[ModelType], db: Session, obj: ModelType
    ) -> ModelType:
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @classmethod
    def read(cls: Type[ModelType], db: Session, id: int) -> ModelType:
        obj = db.get(cls, id)
        if not obj:
            raise NoResultFound
        return obj

    @classmethod
    def read_many(
        cls: Type[ModelType], db: Session, skip: int = 0, limit: int = 100
    ) -> list[ModelType]:
        return db.query(cls).offset(skip).limit(limit).all()

    @classmethod
    def update(
        cls: Type[ModelType], db: Session, id: int, obj_in: ModelType
    ) -> ModelType:
        db_user_in = cls.read(db, id)
        for key, value in jsonable_encoder(obj_in).items():
            setattr(db_user_in, key, value)
        db_user_out = cls.create_or_update(db, db_user_in)
        return db_user_out

    @classmethod
    def delete(cls: Type[ModelType], db: Session, id: int) -> None:
        obj = cls.read(db, id)
        db.delete(obj)
        db.commit()


class CurrencyCode(str):
    @classmethod
    def __get_validators__(
        cls,
    ) -> Generator[Callable[[Any], str], None, None]:
        yield cls.validate

    @classmethod
    def validate(cls, v: Any) -> str:
        if not isinstance(v, str):
            raise TypeError("string required")
        if v not in [currency.alpha_3 for currency in pycountry.currencies]:
            raise ValueError("Invalid currency code")
        return v
