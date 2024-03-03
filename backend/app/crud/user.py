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

from sqlalchemy.orm import Session

from app.crud.common import CRUDBase
from app.models.transactiongroup import TransactionGroup
from app.models.user import User
from app.schemas.transactiongroup import (
    TransactionGroupApiIn,
    TransactionGroupApiOut,
)
from app.schemas.user import UserApiOut, UserApiIn

logger = logging.getLogger(__name__)


class CRUDUser(CRUDBase[User, UserApiOut, UserApiIn]):
    db_model = User
    out_model = UserApiOut

    @classmethod
    def read_by_email(cls, db: Session, email: str) -> UserApiOut:
        return UserApiOut.model_validate(User.read_by_email(db, email=email))

    @classmethod
    def authenticate(cls, db: Session, email: str, password: str) -> UserApiOut:
        return UserApiOut.model_validate(User.authenticate(db, email, password))

    @classmethod
    def update_transaction_group(
        cls,
        db: Session,
        user_id: int,
        transaction_group_id: int,
        transaction_group_in: TransactionGroupApiIn,
    ) -> TransactionGroupApiOut:
        user_out = cls.read(db, id=user_id)
        transaction_group = TransactionGroup.update(
            db, transaction_group_id, **transaction_group_in.model_dump()
        )
        return TransactionGroupApiOut.model_validate(transaction_group)
