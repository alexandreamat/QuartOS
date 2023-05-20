from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session

from pydantic import BaseModel
from sqlalchemy.exc import NoResultFound

from app.db.base_class import Base
from app.schemas.base import OrmBase

ModelType = TypeVar("ModelType", bound=Base)
SchemaCreateType = TypeVar("SchemaCreateType", bound=BaseModel)
SchemaReadType = TypeVar("SchemaReadType", bound=OrmBase)
SchemaUpdateType = TypeVar("SchemaUpdateType", bound=BaseModel)


class CRUDBase(
    Generic[
        ModelType,
        SchemaCreateType,
        SchemaReadType,
        SchemaUpdateType,
    ]
):
    def __init__(self, model: Type[ModelType], schema_read: Type[SchemaReadType]):
        """
        CRUD object with default methods to Create, Read, Update, Delete (CRUD).

        **Parameters**

        * `model`: A SQLAlchemy model class
        * `schema`: A Pydantic model (schema) class
        """
        self.model = model
        self.schema_read = schema_read

    def _select(self, db: Session, id: int) -> ModelType:
        db_obj = db.get(self.model, id)
        if not db_obj:
            raise NoResultFound
        return db_obj

    def _insert_or_update(self, db: Session, db_obj: ModelType) -> ModelType:
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def read(self, db: Session, id: int) -> SchemaReadType:
        return self.schema_read.from_orm(self._select(db, id))

    def read_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[SchemaReadType]:
        return [
            self.schema_read.from_orm(s)
            for s in db.query(self.model).offset(skip).limit(limit).all()
        ]

    def create(
        self, db: Session, *, new_schema_obj: SchemaCreateType
    ) -> SchemaReadType:
        db_obj = self.model(**new_schema_obj.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return self.schema_read.from_orm(db_obj)

    def update(
        self,
        db: Session,
        *,
        id: int,
        new_schema_obj: SchemaUpdateType,
    ) -> SchemaReadType:
        db_obj = self._select(db, id)
        for key, val in new_schema_obj.dict().items():
            setattr(db_obj, key, val)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return self.schema_read.from_orm(db_obj)

    def delete(self, db: Session, *, id: int) -> SchemaReadType:
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return self.schema_read.from_orm(obj)
