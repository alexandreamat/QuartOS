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

from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from app.features.user import CRUDUser, UserApiIn
from app.settings import settings


def init_db(db: Session) -> None:
    try:
        CRUDUser.read_by_email(db, email=settings.FIRST_SUPERUSER)
    except NoResultFound:
        user_in = UserApiIn(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            full_name=settings.FIRST_SUPERUSER_FULL_NAME,
            is_superuser=True,
            default_currency_code="USD",
        )
        CRUDUser.create(db, obj_in=user_in)
