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
