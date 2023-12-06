from typing import Generic, Type, TypeVar, Iterable, Any

from sqlmodel import Session

from .models import (
    Base,
    SyncableBase,
    PlaidOutMixin,
    PlaidInMixin,
    ApiOutMixin,
    ApiInMixin,
)

ModelType = TypeVar("ModelType", bound=Base)
InModelType = TypeVar("InModelType", bound=ApiInMixin)
OutModelType = TypeVar("OutModelType", bound=ApiOutMixin)


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


SyncableModelType = TypeVar("SyncableModelType", bound=SyncableBase)
PlaidInModelType = TypeVar("PlaidInModelType", bound=PlaidInMixin)
PlaidOutModelType = TypeVar("PlaidOutModelType", bound=PlaidOutMixin)


class CRUDSyncedBase(
    Generic[SyncableModelType, PlaidOutModelType, PlaidInModelType],
    CRUDBase[SyncableModelType, PlaidOutModelType, PlaidInModelType],
):
    db_model: Type[SyncableModelType]
    out_model: Type[PlaidOutModelType]

    @classmethod
    def read_by_plaid_id(cls, db: Session, id: str) -> PlaidOutModelType:
        return cls.out_model.from_orm(cls.db_model.read_by_plaid_id(db, id))
