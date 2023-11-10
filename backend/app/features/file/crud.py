# Copyright (C) 2023 Alexandre Amat
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
from datetime import datetime, timezone
import io


from sqlmodel import Session
from app.common.crud import CRUDBase

from .models import File, FileApiIn, FileApiOut


class CRUDFile(CRUDBase[File, FileApiOut, FileApiIn]):
    db_model = File
    out_model = FileApiOut

    @classmethod
    def create(cls, db: Session, file_in: FileApiIn, **kwargs: Any) -> FileApiOut:
        file = File.from_schema(file_in, uploaded=datetime.now(timezone.utc), **kwargs)
        file = File.create(db, file)
        return FileApiOut.from_orm(file)

    @classmethod
    def read_data(cls, db: Session, file_id: int) -> bytes:
        file = File.read(db, file_id)
        return file.data
