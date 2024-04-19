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

from sqlalchemy.orm import Mapped, Session

from app.models.common import Base
from app.utils import verify_password, get_password_hash

logger = logging.getLogger(__name__)


class User(Base):
    __tablename__ = "user"
    email: Mapped[str]
    full_name: Mapped[str]
    default_currency_code: Mapped[str]
    type: Mapped[str]

    __mapper_args__ = {
        "polymorphic_on": "type",
        "polymorphic_identity": "user",
    }


class ProtectedUser(User):
    hashed_password: Mapped[str]

    @property
    def password(self) -> str:
        raise NotImplementedError

    @password.setter
    def password(self, value: str) -> None:
        self.hashed_password = get_password_hash(value)

    @classmethod
    def authenticate(cls, db: Session, email: str, password: str) -> "User":
        db_user = db.scalars(cls.select(email__eq=email)).one()
        assert db_user.hashed_password
        verify_password(password, db_user.hashed_password)
        return db_user

    __mapper_args__ = {"polymorphic_abstract": True}


class DefaultUser(ProtectedUser):
    __mapper_args__ = {"polymorphic_identity": "defaultuser"}


class SuperUser(ProtectedUser):
    __mapper_args__ = {"polymorphic_identity": "superuser"}


class DemoUser(User):
    client_host: Mapped[str]

    __mapper_args__ = {"polymorphic_identity": "demouser"}
