import json
from typing import TypeVar, Type, Any, Generator, Callable

import pycountry
from pydantic import validator
from sqlmodel import Session, SQLModel, Field, select
from sqlalchemy.exc import NoResultFound
from fastapi.encoders import jsonable_encoder


ModelType = TypeVar("ModelType", bound="IdentifiableBase")
PlaidModelType = TypeVar("PlaidModelType", bound="PlaidMaybeMixin")


class IdentifiableBase(SQLModel):
    id: int = Field(primary_key=True)

    @classmethod
    def create_or_update(
        cls: Type[ModelType], db: Session, obj: ModelType
    ) -> ModelType:
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @classmethod
    def read(cls: Type[ModelType], db: Session, id: int) -> ModelType:
        obj = db.get(cls, id)
        if not obj:
            raise NoResultFound
        return obj

    @classmethod
    def read_many(
        cls: Type[ModelType], db: Session, skip: int = 0, limit: int = 100
    ) -> list[ModelType]:
        return db.query(cls).offset(skip).limit(limit).all()

    @classmethod
    def delete(cls: Type[ModelType], db: Session, id: int) -> None:
        obj = cls.read(db, id)
        db.delete(obj)
        db.commit()


class PlaidBase(SQLModel):
    plaid_id: str = Field(unique=True)
    plaid_metadata: str


class PlaidMaybeMixin(SQLModel):
    plaid_id: str | None = Field(unique=True)
    plaid_metadata: str | None

    @classmethod
    def read_by_plaid_id(
        cls: Type[PlaidModelType], db: Session, plaid_id: str
    ) -> PlaidModelType:
        obj = db.exec(select(cls).where(cls.plaid_id == plaid_id)).first()
        if not obj:
            raise NoResultFound
        return obj


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
