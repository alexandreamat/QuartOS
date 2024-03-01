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

from sqlalchemy import Select, select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from app.exceptions.common import ObjectNotFoundError
from app.models.common import Base, SyncableBase
from app.schemas.common import PlaidOutMixin, PlaidInMixin, ApiOutMixin, ApiInMixin

ModelType = TypeVar("ModelType", bound=Base)
InModelType = TypeVar("InModelType", bound=ApiInMixin)
OutModelType = TypeVar("OutModelType", bound=ApiOutMixin)

logger = logging.getLogger(__name__)


class CRUDBase(Generic[ModelType, OutModelType, InModelType]):
    db_model: Type[ModelType]
    out_model: Type[OutModelType]

    @classmethod
    def select(
        cls, *, id: int | None = None, page: int = 0, per_page: int = 0, **kwargs: Any
    ) -> Select[tuple[ModelType]]:
        statement = select(cls.db_model)
        for kw, arg in kwargs.items():
            statement = statement.where(getattr(cls.db_model, kw) == arg)
        if id:
            statement = statement.where(cls.db_model.id == id)
        statement = statement.group_by(cls.db_model.id)
        if per_page:
            offset = page * per_page
            statement = statement.offset(offset).limit(per_page)
        return statement

    @classmethod
    def model_validate(cls, obj: ModelType) -> OutModelType:
        return cls.out_model.model_validate(obj)

    @classmethod
    def create(
        cls,
        db: Session,
        obj_in: InModelType,
        **kwargs: Any,
    ) -> OutModelType:
        obj = cls.db_model.create(db, **obj_in.model_dump(), **kwargs)
        obj_out: OutModelType = cls.model_validate(obj)
        return obj_out

    @classmethod
    def read(cls, db: Session, id: int, **kwargs: Any) -> OutModelType:
        statement = cls.select(id=id, **kwargs)
        try:
            obj = db.scalars(statement).one()
        except NoResultFound:
            raise ObjectNotFoundError(str(cls.db_model.__tablename__), id)
        return cls.model_validate(obj)

    @classmethod
    def read_many(cls, db: Session, **kwargs: Any) -> Iterable[OutModelType]:
        statement = cls.select(**kwargs)
        for s in db.scalars(statement).all():
            yield cls.model_validate(s)

    @classmethod
    def update(
        cls, db: Session, id: int, obj_in: InModelType, **kwargs: Any
    ) -> OutModelType:
        obj = cls.db_model.update(db, id, **obj_in.model_dump(), **kwargs)
        obj_out: OutModelType = cls.model_validate(obj)
        return obj_out

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
        return cls.model_validate(cls.db_model.read_by_plaid_id(db, id))
