from typing import TypeVar, Type

from sqlalchemy.ext.declarative import as_declarative, declared_attr
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from sqlalchemy import Column, Integer
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel


ModelType = TypeVar("ModelType", bound="Base")


@as_declarative()
class Base:
    __name__: str
    id = Column(Integer, primary_key=True, index=True)

    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()

    @classmethod
    def from_schema(cls: Type[ModelType], schema_obj: BaseModel) -> ModelType:
        return cls(**schema_obj.dict())

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
