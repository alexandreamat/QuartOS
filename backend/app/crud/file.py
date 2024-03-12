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

from typing import Any
from sqlalchemy import Select
from sqlalchemy.orm import Session

from app.crud.common import CRUDBase
from app.models.account import Account, NonInstitutionalAccount
from app.models.file import File
from app.models.transaction import Transaction
from app.models.userinstitutionlink import UserInstitutionLink
from app.schemas.file import FileApiIn, FileApiOut


class CRUDFile(CRUDBase[File, FileApiOut, FileApiIn]):
    __model__ = File
    __out_schema__ = FileApiOut

    @classmethod
    def select(cls, user_id: int | None = None, **kwargs: Any) -> Select[tuple[File]]:
        statement = super().select(**kwargs)
        if user_id:
            statement = statement.join(Transaction)
            statement = statement.join(Account)
            statement = statement.outerjoin(UserInstitutionLink)
            statement = statement.where(
                (NonInstitutionalAccount.user_id == user_id)
                | (UserInstitutionLink.user_id == user_id)
            )
        return statement

    @classmethod
    def read_data(cls, db: Session, file_id: int) -> bytes:
        return File.read(db, id__eq=file_id).data
