from typing import Generic, Type, TypeVar

from sqlmodel import Session, SQLModel
from fastapi.encoders import jsonable_encoder

from . import models

DBModelType = TypeVar("DBModelType", bound=models.IdentifiableBase)
ApiInModel = TypeVar("ApiInModel", bound=SQLModel)
ApiOutModel = TypeVar("ApiOutModel", bound=models.IdentifiableBase)
PlaidInModel = TypeVar("PlaidInModel", bound=models.PlaidBase)
PlaidOutModel = TypeVar("PlaidOutModel", bound=models.IdentifiableBase)


class CRUDBase(Generic[DBModelType, ApiOutModel, ApiInModel]):
    db_model: Type[DBModelType]
    api_out_model: Type[ApiOutModel]

    @classmethod
    def create(
        cls,
        db: Session,
        new_schema_obj: ApiInModel,
    ) -> ApiOutModel:
        db_obj_in = cls.db_model.from_schema(new_schema_obj)
        db_obj_out = cls.db_model.create_or_update(db, db_obj_in)
        api_out_obj: ApiOutModel = cls.api_out_model.from_orm(db_obj_out)
        return api_out_obj

    @classmethod
    def read(cls, db: Session, id: int) -> ApiOutModel:
        api_out_obj: ApiOutModel = cls.api_out_model.from_orm(cls.db_model.read(db, id))
        return api_out_obj

    @classmethod
    def read_many(
        cls, db: Session, skip: int = 0, limit: int = 100
    ) -> list[ApiOutModel]:
        return [
            cls.api_out_model.from_orm(s)
            for s in cls.db_model.read_many(db, skip, limit)
        ]

    @classmethod
    def update(cls, db: Session, id: int, new_obj: ApiInModel) -> ApiOutModel:
        db_obj = cls.db_model.update(db, id, new_obj)
        db_obj_out = cls.db_model.create_or_update(db, db_obj)
        api_out_obj: ApiOutModel = cls.api_out_model.from_orm(db_obj_out)
        return api_out_obj

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
        plaid_out_obj: PlaidOutModel = cls.plaid_out_model.from_orm(db_obj_out)
        return plaid_out_obj

    @classmethod
    def resync(cls, db: Session, id: int, new_obj: PlaidInModel) -> PlaidOutModel:
        db_obj = cls.db_model.update(db, id, new_obj)
        db_obj_out = cls.db_model.create_or_update(db, db_obj)
        plaid_out_obj: PlaidOutModel = cls.plaid_out_model.from_orm(db_obj_out)
        return plaid_out_obj

    @classmethod
    def is_synced(cls, db: Session, id: int) -> bool:
        return cls.db_model.read(db, id).is_synced

    @classmethod
    def read_by_plaid_id(cls, db: Session, name: str) -> PlaidOutModel:
        plaid_out_obj: PlaidOutModel = cls.plaid_out_model.from_orm(
            cls.db_model.read_by_plaid_id(db, name)
        )
        return plaid_out_obj

    @classmethod
    def read_many_plaid(
        cls, db: Session, skip: int = 0, limit: int = 100
    ) -> list[PlaidOutModel]:
        return [
            cls.plaid_out_model.from_orm(s)
            for s in cls.db_model.read_many(db, skip, limit)
        ]

    @classmethod
    def read_plaid(cls, db: Session, id: int) -> PlaidOutModel:
        plaid_out_obj: PlaidOutModel = cls.plaid_out_model.from_orm(
            cls.db_model.read(db, id)
        )
        return plaid_out_obj
