from typing import TypeVar, Type, Any, Generator, Callable

import pycountry
from sqlmodel import Session, SQLModel, Field, select
from sqlmodel.sql.expression import SelectOfScalar
from sqlalchemy.exc import NoResultFound


ModelType = TypeVar("ModelType", bound="Base")
SyncableModelType = TypeVar("SyncableModelType", bound="SyncableBase")
ApiInModel = TypeVar("ApiInModel", bound=SQLModel)


class Base(SQLModel):
    id: int = Field(primary_key=True)

    @classmethod
    def __add(cls: Type[ModelType], db: Session, obj: ModelType) -> ModelType:
        db.add(obj)
        db.flush()
        db.refresh(obj)
        return obj

    @classmethod
    def select(cls: Type[ModelType]) -> SelectOfScalar[ModelType]:
        return select(cls)

    @classmethod
    def from_schema(cls: Type[ModelType], obj_in: ApiInModel) -> ModelType:
        return cls(**obj_in.dict())

    @classmethod
    def create(cls: Type[ModelType], db: Session, obj: ModelType) -> ModelType:
        return cls.__add(db, obj)

    @classmethod
    def read(cls: Type[ModelType], db: Session, id: int) -> ModelType:
        obj = db.get(cls, id)
        if not obj:
            raise NoResultFound
        return obj

    @classmethod
    def read_many(
        cls: Type[ModelType],
        db: Session,
        offset: int,
        limit: int,
    ) -> list[ModelType]:
        statement = cls.select()
        if offset:
            statement = statement.offset(offset)
        if limit:
            statement = statement.limit(limit)
        return db.exec(statement).all()

    @classmethod
    def update(
        cls: Type[ModelType], db: Session, id: int, obj_in: ModelType
    ) -> ModelType:
        db_obj = cls.read(db, id)
        for key, value in obj_in.dict(exclude={"id"}).items():
            setattr(db_obj, key, value)
        return cls.__add(db, db_obj)

    @classmethod
    def delete(cls: Type[ModelType], db: Session, id: int) -> None:
        obj = cls.read(db, id)
        db.delete(obj)
        db.flush()


class SyncedMixin(SQLModel):
    plaid_id: str
    plaid_metadata: str


class SyncableBase(Base):
    plaid_id: str | None = Field(unique=True)
    plaid_metadata: str | None

    @classmethod
    def read_by_plaid_id(
        cls: Type[SyncableModelType], db: Session, plaid_id: str
    ) -> SyncableModelType:
        obj = db.exec(select(cls).where(cls.plaid_id == plaid_id)).first()
        if not obj:
            raise NoResultFound
        return obj


class SyncedBase(SyncableBase):
    plaid_id: str = Field(unique=True)
    plaid_metadata: str


class CurrencyCode(str):
    @classmethod
    def __get_validators__(
        cls,
    ) -> Generator[Callable[[Any], str], None, None]:
        yield cls.validate

    @classmethod
    def validate(cls, v: Any) -> str:
        if not isinstance(v, str):
            raise TypeError("string required")
        if v not in [currency.alpha_3 for currency in pycountry.currencies]:
            raise ValueError("Invalid currency code")
        return v


class CodeSnippet(str):
    @classmethod
    def __get_validators__(
        cls,
    ) -> Generator[Callable[[Any], str], None, None]:
        yield cls.validate

    @classmethod
    def validate(cls, v: str) -> str:
        exec(f"def deserialize_field(row): return {v}")
        return v
