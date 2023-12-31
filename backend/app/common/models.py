# Copyright (C) 2024 Alexandre Amat
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

import re
from typing import Iterable, TypeVar, Type, Any, Annotated

import pycountry
from pydantic import AfterValidator, HttpUrl
from pydantic_extra_types.color import Color
from sqlalchemy import types
from sqlalchemy.exc import NoResultFound
from sqlmodel import Session, SQLModel, Field, String, select
from sqlmodel.sql.expression import SelectOfScalar

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
        return cls(**obj_in.model_dump(), **kwargs)

    @classmethod
    def create(cls: Type[BaseType], db: Session, obj: BaseType) -> BaseType:
        db.add(obj)
        db.flush()
        return obj

    @classmethod
    def read(cls: Type[BaseType], db: Session, id: int) -> BaseType:
        statement = cls.select().where(cls.id == id)
        return cls.read_one_from_query(db, statement, id)

    @classmethod
    def read_one_from_query(
        cls: Type[BaseType],
        db: Session,
        statement: SelectOfScalar[BaseType],
        id: int | None = None,
    ) -> BaseType:
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
    ) -> Iterable[BaseType]:
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
        return db.exec(select(cls).where(cls.plaid_id == plaid_id)).one()


class SyncedBase(SyncableBase):
    plaid_id: str = Field(unique=True)
    plaid_metadata: str


def validate_currency_code(v: str) -> str:
    if v not in [currency.alpha_3 for currency in pycountry.currencies]:
        raise ValueError("Invalid currency code")
    return v


CurrencyCode = Annotated[str, AfterValidator(validate_currency_code)]


def validate_code_snippet(v: str) -> str:
    exec(f"def deserialize_field(row): return {v}")
    return v


CodeSnippet = Annotated[str, AfterValidator(validate_code_snippet)]


def validate_regex_pattern(v: str) -> str:
    re.compile(v)
    return v


RegexPattern = Annotated[str, AfterValidator(validate_regex_pattern)]


def validate_country_code(v: str) -> str:
    if v not in [country.alpha_2 for country in pycountry.countries]:
        raise ValueError("Invalid country code")
    return v


CountryCode = Annotated[str, AfterValidator(validate_country_code)]


class UrlType(types.TypeDecorator[HttpUrl]):
    impl = String

    def process_bind_param(self, value: HttpUrl | None, dialect: Any) -> str | None:
        return str(value) if value else None

    def process_result_value(self, value: str | None, dialect: Any) -> HttpUrl | None:
        return HttpUrl(value) if value else None


class ColorType(types.TypeDecorator[Color]):
    impl = String

    def process_bind_param(self, value: Color | None, dialect: Any) -> str | None:
        return value.as_hex() if value else None

    def process_result_value(self, value: str | None, dialect: Any) -> Color | None:
        return Color(value) if value else None
