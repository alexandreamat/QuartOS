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
from typing import Any, Type

from sqlalchemy.orm import Session

from app.crud.common import CRUDBase
from app.models.user import DefaultUser, DemoUser, SuperUser, User
from app.schemas.account import AccountApiIn
from app.schemas.user import (
    DefaultUserApiIn,
    DefaultUserApiOut,
    DemoUserApiIn,
    DemoUserApiOut,
    SuperUserApiIn,
    SuperUserApiOut,
    UserApiOut,
    UserApiIn,
)

logger = logging.getLogger(__name__)


class CRUDUser(CRUDBase[User, UserApiOut, UserApiIn]):
    __model__ = User

    __out_schemas__: dict[Type[User], Type[UserApiOut]] = {
        DefaultUser: DefaultUserApiOut,
        DemoUser: DemoUserApiOut,
        SuperUser: SuperUserApiOut,
    }
    __in_schemas__: dict[Type[UserApiIn], Type[User]] = {
        DefaultUserApiIn: DefaultUser,
        DemoUserApiIn: DemoUser,
        SuperUserApiIn: SuperUser,
    }

    @classmethod
    def model_validate(cls, user: User) -> UserApiOut:
        return cls.__out_schemas__[type(user)].model_validate(user)

    @classmethod
    def create(cls, db: Session, obj_in: UserApiIn, **kwargs: Any) -> UserApiOut:
        obj = cls.__in_schemas__[type(obj_in)].create(
            db, **obj_in.model_dump(), **kwargs
        )
        return cls.model_validate(obj)

    @classmethod
    def authenticate(cls, db: Session, email: str, password: str) -> UserApiOut:
        return UserApiOut.model_validate(User.authenticate(db, email, password))
