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

# 1. Import base model
from sqlmodel import Session
from sqlalchemy.exc import NoResultFound

from app.settings import settings
from app.features.user import CRUDUser, UserApiIn

# 1. Import base model
from app.common.models import Base

# 2. Import inheritors of the base model
from app.features.replacementpattern import ReplacementPattern
from app.features.transactiondeserialiser import TransactionDeserialiser
from app.features.user import User
from app.features.institution import Institution
from app.features.userinstitutionlink import UserInstitutionLink
from app.features.account import Account
from app.features.movement import Movement
from app.features.transaction import Transaction

from .deps import engine


def init_db(db: Session) -> None:
    # 3. Retrieve inheritors from base through metadata
    Base.metadata.create_all(engine)

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
