from typing import Generic, Type, TypeVar

from sqlalchemy.orm import Session
from pydantic import BaseModel

from app import models, schemas

ModelType = TypeVar("ModelType", bound=models.Base)
WriteSchemaType = TypeVar("WriteSchemaType", bound=BaseModel)
ReadSchemaType = TypeVar("ReadSchemaType", bound=schemas.OrmBase)


class CRUDBase(Generic[ModelType, ReadSchemaType, WriteSchemaType]):
    model_type: Type[ModelType]
    read_schema_type: Type[ReadSchemaType]
    write_schema_type: Type[WriteSchemaType]

    @classmethod
    def create(
        cls,
        db: Session,
        new_schema_obj: WriteSchemaType,
    ) -> ReadSchemaType:
        db_obj_in = cls.model_type.from_schema(new_schema_obj)
        db_obj_out = cls.model_type.create_or_update(db, db_obj_in)
        return cls.read_schema_type.from_orm(db_obj_out)

    @classmethod
    def read(cls, db: Session, id: int) -> ReadSchemaType:
        return cls.read_schema_type.from_orm(cls.model_type.read(db, id))

    @classmethod
    def read_many(
        cls, db: Session, skip: int = 0, limit: int = 100
    ) -> list[ReadSchemaType]:
        return [
            cls.read_schema_type.from_orm(s)
            for s in cls.model_type.read_many(db, skip, limit)
        ]

    @classmethod
    def update(
        cls, db: Session, id: int, new_schema_obj: WriteSchemaType
    ) -> ReadSchemaType:
        db_obj_in = cls.model_type.from_schema(new_schema_obj)
        db_obj_out = cls.model_type.update(db, id, db_obj_in)
        return cls.read_schema_type.from_orm(db_obj_out)

    @classmethod
    def delete(cls, db: Session, id: int) -> None:
        cls.model_type.delete(db, id)
