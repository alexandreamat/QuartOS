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

from sqlmodel import Session, SQLModel

from .models import Base, SyncableBase, SyncedBase, SyncedMixin

ModelType = TypeVar("ModelType", bound=Base)
InModelType = TypeVar("InModelType", bound=SQLModel)
OutModelType = TypeVar("OutModelType", bound=Base)

logger = logging.getLogger(__name__)


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
        obj = cls.db_model.create(db, **obj_in.model_dump(), **kwargs)
        obj_out: OutModelType = cls.out_model.model_validate(obj)
        return obj_out

    @classmethod
    def read(cls, db: Session, id: int) -> OutModelType:
        obj = cls.db_model.read(db, id)
        obj_out: OutModelType = cls.out_model.model_validate(obj)
        return obj_out

    @classmethod
    def read_many(cls, db: Session, offset: int, limit: int) -> Iterable[OutModelType]:
        for s in cls.db_model.read_many(db, offset, limit):
            yield cls.out_model.model_validate(s)

    @classmethod
    def update(
        cls, db: Session, id: int, obj_in: InModelType, **kwargs: Any
    ) -> OutModelType:
        obj = cls.db_model.update(db, id, **obj_in.model_dump(), **kwargs)
        obj_out: OutModelType = cls.out_model.model_validate(obj)
        return obj_out

    @classmethod
    def delete(cls, db: Session, id: int) -> int:
        cls.db_model.delete(db, id)
        return id


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
    def read_by_plaid_id(cls, db: Session, id: str) -> PlaidOutModel:
        return cls.out_model.model_validate(cls.db_model.read_by_plaid_id(db, id))
