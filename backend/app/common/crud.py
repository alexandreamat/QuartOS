from typing import Generic, Type, TypeVar

from sqlmodel import Session, SQLModel

from . import models

DBModelType = TypeVar("DBModelType", bound=models.Base)
WriteModelType = TypeVar("WriteModelType", bound=SQLModel)
SyncModelType = TypeVar("SyncModelType", bound=SQLModel)
ReadModelType = TypeVar("ReadModelType", bound=models.Base)


class CRUDBase(Generic[DBModelType, ReadModelType, WriteModelType]):
    db_model_type: Type[DBModelType]
    read_model_type: Type[ReadModelType]
    write_model_type: Type[WriteModelType]

    @classmethod
    def db_obj_from_schema(cls, obj_in: WriteModelType) -> DBModelType:
        return cls.db_model_type(**obj_in.dict())

    @classmethod
    def create(
        cls,
        db: Session,
        new_schema_obj: WriteModelType,
    ) -> ReadModelType:
        db_obj_in = cls.db_obj_from_schema(new_schema_obj)
        db_obj_out = cls.db_model_type.create_or_update(db, db_obj_in)
        return cls.read_model_type.from_orm(db_obj_out)

    @classmethod
    def read(cls, db: Session, id: int) -> ReadModelType:
        return cls.read_model_type.from_orm(cls.db_model_type.read(db, id))

    @classmethod
    def read_many(
        cls, db: Session, skip: int = 0, limit: int = 100
    ) -> list[ReadModelType]:
        return [
            cls.read_model_type.from_orm(s)
            for s in cls.db_model_type.read_many(db, skip, limit)
        ]

    @classmethod
    def update(
        cls, db: Session, id: int, new_schema_obj: WriteModelType
    ) -> ReadModelType:
        db_obj_in = cls.db_obj_from_schema(new_schema_obj)
        db_obj_out = cls.db_model_type.update(db, id, db_obj_in)
        return cls.read_model_type.from_orm(db_obj_out)

    @classmethod
    def delete(cls, db: Session, id: int) -> None:
        cls.db_model_type.delete(db, id)


class CRUDSyncable(Generic[DBModelType, ReadModelType, SyncModelType]):
    db_model_type: Type[DBModelType]
    read_model_type: Type[ReadModelType]

    @classmethod
    def sync(cls, db: Session, obj: SyncModelType) -> ReadModelType:
        db_obj_in = cls.db_model_type(**obj.dict())
        db_obj_out = cls.db_model_type.create_or_update(db, db_obj_in)
        return cls.read_model_type.from_orm(db_obj_out)

    @classmethod
    def is_synced(cls, db: Session, id: int) -> bool:
        return cls.db_model_type.read(db, id).is_synced
