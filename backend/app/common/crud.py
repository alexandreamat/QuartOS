from typing import Generic, Type, TypeVar, Iterable, Any

from sqlmodel import Session, SQLModel

from .models import Base, SyncableBase, SyncedBase, SyncedMixin

DBModelType = TypeVar("DBModelType", bound=Base)
ApiInModel = TypeVar("ApiInModel", bound=SQLModel)
ApiOutModel = TypeVar("ApiOutModel", bound=Base)


class CRUDBase(Generic[DBModelType, ApiOutModel, ApiInModel]):
    db_model: Type[DBModelType]
    out_model: Type[ApiOutModel]

    @classmethod
    def create(
        cls,
        db: Session,
        new_schema_obj: ApiInModel,
        **kwargs: Any,
    ) -> ApiOutModel:
        db_obj_in = cls.db_model.from_schema(new_schema_obj, **kwargs)
        db_obj_out = cls.db_model.create(db, db_obj_in)
        api_out_obj: ApiOutModel = cls.out_model.from_orm(db_obj_out)
        return api_out_obj

    @classmethod
    def read(cls, db: Session, id: int) -> ApiOutModel:
        api_out_obj: ApiOutModel = cls.out_model.from_orm(cls.db_model.read(db, id))
        return api_out_obj

    @classmethod
    def read_many(cls, db: Session, offset: int, limit: int) -> Iterable[ApiOutModel]:
        for s in cls.db_model.read_many(db, offset, limit):
            yield cls.out_model.from_orm(s)

    @classmethod
    def update(
        cls,
        db: Session,
        id: int,
        new_obj: ApiInModel,
        **kwargs: Any,
    ) -> ApiOutModel:
        db_obj_in = cls.db_model.from_schema(new_obj, **kwargs)
        db_obj_out = cls.db_model.update(db, id, db_obj_in)
        api_out_obj: ApiOutModel = cls.out_model.from_orm(db_obj_out)
        return api_out_obj

    @classmethod
    def delete(cls, db: Session, id: int) -> None:
        cls.db_model.delete(db, id)


DBSyncableModelType = TypeVar("DBSyncableModelType", bound=SyncableBase)
PlaidInModel = TypeVar("PlaidInModel", bound=SyncedMixin)
PlaidOutModel = TypeVar("PlaidOutModel", bound=SyncedBase)


class CRUDSyncedBase(
    Generic[DBSyncableModelType, PlaidOutModel, PlaidInModel],
    CRUDBase[DBSyncableModelType, PlaidOutModel, PlaidInModel],
):
    db_model: Type[DBSyncableModelType]
    out_model: Type[PlaidOutModel]

    @classmethod
    def is_synced(cls, db: Session, id: int) -> bool:
        return cls.db_model.read(db, id).is_synced

    @classmethod
    def read_by_plaid_id(cls, db: Session, id: str) -> PlaidOutModel:
        return cls.out_model.from_orm(cls.db_model.read_by_plaid_id(db, id))
