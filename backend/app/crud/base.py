from typing import Generic, Type, TypeVar

from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from pydantic import BaseModel

from app import models, schemas

ModelType = TypeVar("ModelType", bound=models.Base)
WriteSchemaType = TypeVar("WriteSchemaType", bound=BaseModel)
ReadSchemaType = TypeVar("ReadSchemaType", bound=schemas.OrmBase)


class CRUDFactory(Generic[ModelType, ReadSchemaType, WriteSchemaType]):
    def __init__(
        cls,
        model: Type[ModelType],
        read_schema_type: Type[ReadSchemaType],
        write_schema_type: Type[WriteSchemaType],
    ):
        cls.model = model
        cls.read_schema_type = read_schema_type
        cls.write_schema_type = write_schema_type

    def create(
        cls,
        db: Session,
        new_schema_obj: WriteSchemaType,
    ) -> ReadSchemaType:
        db_obj_in = cls.model.from_schema(new_schema_obj)
        db_obj_out = cls.model.create_or_update(db, db_obj_in)
        return cls.read_schema_type.from_orm(db_obj_out)

    def read(cls, db: Session, id: int) -> ReadSchemaType:
        return cls.read_schema_type.from_orm(cls.model.read(db, id))

    def read_many(
        cls, db: Session, skip: int = 0, limit: int = 100
    ) -> list[ReadSchemaType]:
        return [
            cls.read_schema_type.from_orm(s)
            for s in cls.model.read_many(db, skip, limit)
        ]

    def update(
        cls, db: Session, id: int, new_schema_obj: WriteSchemaType
    ) -> ReadSchemaType:
        db_obj_in = cls.model.from_schema(new_schema_obj)
        db_obj_out = cls.model.update(db, id, db_obj_in)
        return cls.read_schema_type.from_orm(db_obj_out)

    def delete(cls, db: Session, id: int) -> None:
        cls.model.delete(db, id)
