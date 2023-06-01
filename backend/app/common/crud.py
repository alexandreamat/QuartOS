from typing import Generic, Type, TypeVar

from sqlmodel import Session, SQLModel

from . import models

DBModelType = TypeVar("DBModelType", bound=models.IdentifiableBase)
ApiInModel = TypeVar("ApiInModel", bound=SQLModel)
ApiOutModel = TypeVar("ApiOutModel", bound=models.IdentifiableBase)
PlaidInModel = TypeVar("PlaidInModel", bound=SQLModel)
PlaidOutModel = TypeVar("PlaidOutModel", bound=models.IdentifiableBase)


class CRUDBase(Generic[DBModelType, ApiOutModel, ApiInModel]):
    db_model: Type[DBModelType]
    api_out_model: Type[ApiOutModel]

    @classmethod
    def db_obj_from_schema(cls, obj_in: ApiInModel) -> DBModelType:
        return cls.db_model(**obj_in.dict())

    @classmethod
    def create(
        cls,
        db: Session,
        new_schema_obj: ApiInModel,
    ) -> ApiOutModel:
        db_obj_in = cls.db_obj_from_schema(new_schema_obj)
        db_obj_out = cls.db_model.create_or_update(db, db_obj_in)
        return cls.api_out_model.from_orm(db_obj_out)

    @classmethod
    def read(cls, db: Session, id: int) -> ApiOutModel:
        return cls.api_out_model.from_orm(cls.db_model.read(db, id))

    @classmethod
    def read_many(
        cls, db: Session, skip: int = 0, limit: int = 100
    ) -> list[ApiOutModel]:
        return [
            cls.api_out_model.from_orm(s)
            for s in cls.db_model.read_many(db, skip, limit)
        ]

    @classmethod
    def update(cls, db: Session, id: int, new_schema_obj: ApiInModel) -> ApiOutModel:
        db_obj_in = cls.db_obj_from_schema(new_schema_obj)
        db_obj_out = cls.db_model.update(db, id, db_obj_in)
        return cls.api_out_model.from_orm(db_obj_out)

    @classmethod
    def delete(cls, db: Session, id: int) -> None:
        cls.db_model.delete(db, id)


class CRUDSyncable(Generic[DBModelType, PlaidOutModel, PlaidInModel]):
    db_model: Type[DBModelType]
    plaid_out_model: Type[PlaidOutModel]

    @classmethod
    def sync(cls, db: Session, obj: PlaidInModel) -> PlaidOutModel:
        db_obj_in = cls.db_model(**obj.dict())
        db_obj_out = cls.db_model.create_or_update(db, db_obj_in)
        return cls.plaid_out_model.from_orm(db_obj_out)

    @classmethod
    def is_synced(cls, db: Session, id: int) -> bool:
        return cls.db_model.read(db, id).is_synced
