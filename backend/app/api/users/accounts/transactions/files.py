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

import mimetypes
from typing import Annotated, Iterable

from fastapi import APIRouter, File as _File, UploadFile
from fastapi.responses import Response

from app.crud.file import CRUDFile
from app.crud.transaction import CRUDTransaction
from app.database.deps import DBSession
from app.deps.user import CurrentUser
from app.schemas.file import FileApiIn, FileApiOut

router = APIRouter()


@router.post("/")
async def create(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    transaction_id: int,
    file: Annotated[UploadFile, _File(...)],
) -> FileApiOut:
    CRUDTransaction.read(
        db,
        id=transaction_id,
        user_id=me.id,
    )
    data = await file.read()
    file_in = FileApiIn(data=data, name=file.filename)
    return CRUDFile.create(db, file_in, transaction_id=transaction_id)


@router.get("/")
def read_many(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    transaction_id: int,
) -> Iterable[FileApiOut]:
    return CRUDFile.read_many(db, user_id=me.id, transaction_id=transaction_id)


@router.get(
    "/{file_id}",
    responses={
        200: {"content": {"application/octet-stream": {}}},
    },
    response_class=Response,
)
def read(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    transaction_id: int,
    file_id: int,
) -> Response:
    CRUDTransaction.read(db, id=transaction_id, user_id=me.id)
    file_out = CRUDFile.read(db, id=file_id)
    headers = {"Content-Disposition": f"attachment; filename={file_out.name}"}
    mime_type, _ = mimetypes.guess_type(file_out.name)
    if mime_type:
        headers.update({"Content-Type": mime_type})
    data = CRUDFile.read_data(db, file_id)
    return Response(data, headers=headers, media_type="application/octet-stream")


@router.delete("/{file_id}")
def delete(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    transaction_id: int,
    file_id: int,
) -> int:
    CRUDTransaction.read(db, id=transaction_id, user_id=me.id)
    return CRUDFile.delete(db, file_id)
