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
import logging
from typing import Iterable, TypeVar, Type, Any

from pydantic import HttpUrl
from pydantic_extra_types.color import Color
from sqlalchemy import ColumnElement, Select, types, select, String, case
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import DeclarativeBase, Session, mapped_column, Mapped

from app.exceptions.common import ObjectNotFoundError

BaseType = TypeVar("BaseType", bound="Base")
SyncableBaseType = TypeVar("SyncableBaseType", bound="SyncableBase")

logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    id: Mapped[int] = mapped_column(primary_key=True)

    @classmethod
    def select(
        cls: Type[BaseType], *, page: int = 0, per_page: int = 0, **kwargs: Any
    ) -> Select[tuple[BaseType]]:
        statement = select(cls)
        for kw, arg in kwargs.items():
            statement = statement.where(getattr(cls, kw) == arg)
        statement = statement.group_by(cls.id)
        if per_page:
            offset = page * per_page
            statement = statement.offset(offset).limit(per_page)
        return statement

    @classmethod
    def create(cls: Type[BaseType], db: Session, **kwargs: Any) -> BaseType:
        obj = cls()
        for key, value in kwargs.items():
            setattr(obj, key, value)
        db.add(obj)
        db.flush()
        return obj

    @classmethod
    def read(cls: Type[BaseType], db: Session, id: int) -> BaseType:
        statement = select(cls).where(cls.id == id)
        return cls.read_one_from_query(db, statement, id)

    @classmethod
    def read_one_from_query(
        cls: Type[BaseType],
        db: Session,
        statement: Select[tuple[BaseType]],
        id: int | None = None,
    ) -> BaseType:
        try:
            return db.scalars(statement).one()
        except NoResultFound:
            raise ObjectNotFoundError(str(cls.__tablename__), id)

    @classmethod
    def read_many(
        cls: Type[BaseType],
        db: Session,
        offset: int,
        limit: int,
    ) -> Iterable[BaseType]:
        statement = select(cls)
        if offset:
            statement = statement.offset(offset)
        if limit:
            statement = statement.limit(limit)
        for result in db.scalars(statement).yield_per(50):
            yield result

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


class SyncableBase(Base):
    __abstract__ = True
    plaid_id: Mapped[str | None] = mapped_column(unique=True)
    plaid_metadata: Mapped[str | None]

    @hybrid_property
    def is_synced(self) -> bool:
        return self.plaid_id is not None

    @is_synced.inplace.expression
    @classmethod
    def _is_synced_expression(cls) -> ColumnElement[bool]:
        return case((cls.plaid_id != None, True), else_=False)


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


class CalculatedColumnsMeta(type):
    def __getattribute__(cls, __name: str) -> Any:
        attr = super().__getattribute__(__name)
        if hasattr(attr, "label"):
            return attr.label(__name)
        return attr
