from typing import Generic, Type, TypeVar, Iterable, Any

from sqlmodel import Session, SQLModel

from .models import Base, SyncableBase, PlaidOutMixin, PlaidInMixin

ModelType = TypeVar("ModelType", bound=Base)
InModelType = TypeVar("InModelType", bound=SQLModel)
OutModelType = TypeVar("OutModelType", bound=Base)


class CRUDBase(Generic[ModelType, OutModelType, InModelType]):
    db_model: Type[ModelType]
    out_model: Type[OutModelType]

    @classmethod
    def create(
        cls,
        db: Session,
        obj_in: InModelType,
        **kwargs: Any,
    ) -> OutModelType:
        db_obj_in = cls.db_model.from_schema(obj_in, **kwargs)
        db_obj_out = cls.db_model.create(db, db_obj_in)
        api_out_obj: OutModelType = cls.out_model.from_orm(db_obj_out)
        return api_out_obj

    @classmethod
    def read(cls, db: Session, id: int) -> OutModelType:
        db_obj = cls.db_model.read(db, id)
        api_out_obj: OutModelType = cls.out_model.from_orm(db_obj)
        return api_out_obj

    @classmethod
    def read_many(cls, db: Session, offset: int, limit: int) -> Iterable[OutModelType]:
        for s in cls.db_model.read_many(db, offset, limit):
            yield cls.out_model.from_orm(s)

    @classmethod
    def update(
        cls, db: Session, id: int, obj_in: InModelType, **kwargs: Any
    ) -> OutModelType:
        obj = cls.db_model.update(db, id, **obj_in.dict(), **kwargs)
        out_obj: OutModelType = cls.out_model.from_orm(obj)
        return out_obj

    @classmethod
    def delete(cls, db: Session, id: int) -> int:
        cls.db_model.delete(db, id)
        return id


DBSyncableModelType = TypeVar("DBSyncableModelType", bound=SyncableBase)
PlaidInModel = TypeVar("PlaidInModel", bound=PlaidInMixin)
PlaidOutModel = TypeVar("PlaidOutModel", bound=PlaidOutMixin)


class CRUDSyncedBase(
    Generic[DBSyncableModelType, PlaidOutModel, PlaidInModel],
    CRUDBase[DBSyncableModelType, PlaidOutModel, PlaidInModel],
):
    db_model: Type[DBSyncableModelType]
    out_model: Type[PlaidOutModel]

    @classmethod
    def read_by_plaid_id(cls, db: Session, id: str) -> PlaidOutModel:
        return cls.out_model.from_orm(cls.db_model.read_by_plaid_id(db, id))
