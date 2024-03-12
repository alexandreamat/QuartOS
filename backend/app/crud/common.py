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
from typing import Generic, Type, TypeVar, Iterable, Any

from fastapi import HTTPException, status
from sqlalchemy import Select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from app.models.common import Base
from app.schemas.common import ApiOutMixin, ApiInMixin

ModelT = TypeVar("ModelT", bound=Base)
InSchemaT = TypeVar("InSchemaT", bound=ApiInMixin)
OutSchemaT = TypeVar("OutSchemaT", bound=ApiOutMixin)


logger = logging.getLogger(__name__)


class CRUDBase(Generic[ModelT, OutSchemaT, InSchemaT]):
    __model__: Type[ModelT]
    __out_schema__: Type[OutSchemaT]

    @classmethod
    def select(cls, **kwargs: Any) -> Select[tuple[ModelT]]:
        return cls.__model__.select(**kwargs)

    @classmethod
    def model_validate(cls, obj: ModelT) -> OutSchemaT:
        return cls.__out_schema__.model_validate(obj)

    @classmethod
    def create(
        cls,
        db: Session,
        obj_in: InSchemaT,
        **kwargs: Any,
    ) -> OutSchemaT:
        obj = cls.__model__.create(db, **obj_in.model_dump(), **kwargs)
        obj_out: OutSchemaT = cls.model_validate(obj)
        return obj_out

    @classmethod
    def read(cls, db: Session, **kwargs: Any) -> OutSchemaT:
        statement = cls.select(**kwargs)
        try:
            obj = db.scalars(statement).one()
        except NoResultFound:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                detail=f"{cls.__model__.__tablename__} not found for args {kwargs}",
            )
        return cls.model_validate(obj)

    @classmethod
    def read_many(cls, db: Session, **kwargs: Any) -> Iterable[OutSchemaT]:
        statement = cls.select(**kwargs)
        for s in db.scalars(statement).all():
            yield cls.model_validate(s)

    @classmethod
    def update(
        cls, db: Session, id: int, obj_in: InSchemaT, **kwargs: Any
    ) -> OutSchemaT:
        obj = cls.__model__.update(db, id, **obj_in.model_dump(), **kwargs)
        obj_out: OutSchemaT = cls.model_validate(obj)
        return obj_out

    @classmethod
    def delete(cls, db: Session, id: int) -> int:
        cls.__model__.delete(db, id)
        return id
