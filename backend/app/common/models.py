from typing import TypeVar, Type, Any, Generator, Callable
import re

import pycountry
from sqlmodel import Session, SQLModel, Field, select
from sqlmodel.sql.expression import SelectOfScalar
from sqlalchemy.exc import NoResultFound

from app.common.exceptions import ObjectNotFoundError

BaseType = TypeVar("BaseType", bound="Base")
SyncableBaseType = TypeVar("SyncableBaseType", bound="SyncableBase")
SchemaType = TypeVar("SchemaType", bound=SQLModel)


class Base(SQLModel):
    id: int = Field(primary_key=True)

    @classmethod
    def select(cls: Type[BaseType]) -> SelectOfScalar[BaseType]:
        return select(cls)

    @classmethod
    def from_schema(cls: Type[BaseType], obj_in: SchemaType, **kwargs: Any) -> BaseType:
        return cls(**obj_in.dict(), **kwargs)

    @classmethod
    def create(cls: Type[BaseType], db: Session, obj: BaseType) -> BaseType:
        db.add(obj)
        db.flush()
        return obj

    @classmethod
    def read(cls: Type[BaseType], db: Session, id: int) -> BaseType:
        statement = cls.select().where(cls.id == id)
        try:
            return db.exec(statement).one()
        except NoResultFound:
            raise ObjectNotFoundError(str(cls.__tablename__), id)

    @classmethod
    def read_many(
        cls: Type[BaseType],
        db: Session,
        offset: int,
        limit: int,
    ) -> list[BaseType]:
        statement = cls.select()
        if offset:
            statement = statement.offset(offset)
        if limit:
            statement = statement.limit(limit)
        return db.exec(statement).all()

    @classmethod
    def update(cls: Type[BaseType], db: Session, id: int, **kwargs: Any) -> BaseType:
        obj = cls.read(db, id)
        for key, value in kwargs.items():
            setattr(obj, key, value)
        db.flush()
        return obj

    @classmethod
    def delete(cls: Type[BaseType], db: Session, id: int) -> None:
        db.delete(cls.read(db, id))


class SyncedMixin(SQLModel):
    plaid_id: str
    plaid_metadata: str


class SyncableBase(Base):
    plaid_id: str | None = Field(unique=True)
    plaid_metadata: str | None

    @classmethod
    def read_by_plaid_id(
        cls: Type[SyncableBaseType], db: Session, plaid_id: str
    ) -> SyncableBaseType:
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


class RegexPattern(str):
    @classmethod
    def __get_validators__(cls) -> Generator[Callable[[Any], str], None, None]:
        yield cls.validate

    @classmethod
    def validate(cls, v: str) -> str:
        re.compile(v)
        return v
