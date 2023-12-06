import io
import mimetypes
from typing import Annotated, Iterable
from fastapi import APIRouter, File as _File, UploadFile
from fastapi.responses import Response

from app.database.deps import DBSession

from app.features.file import CRUDFile, FileApiIn, FileApiOut
from app.features.user import CurrentUser, CRUDUser
from app.features.transaction import CRUDTransaction

router = APIRouter()


@router.post("/")
async def create(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    movement_id: int,
    transaction_id: int,
    file: Annotated[UploadFile, _File(...)],
) -> FileApiOut:
    CRUDUser.read_transaction(
        db, me.id, None, account_id, None, movement_id, transaction_id
    )
    data = await file.read()
    file_in = FileApiIn(filename=file.filename, data=data, name=file.filename)
    return CRUDFile.create(db, file_in, transaction_id=transaction_id)


@router.get("/")
def read_many(
    db: DBSession,
    me: CurrentUser,
    account_id: int,
    movement_id: int,
    transaction_id: int,
) -> Iterable[FileApiOut]:
    CRUDUser.read_transaction(
        db, me.id, None, account_id, None, movement_id, transaction_id
    )
    return CRUDTransaction.read_files(db, transaction_id)


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
    movement_id: int,
    transaction_id: int,
    file_id: int,
) -> Response:
    CRUDUser.read_transaction(
        db, me.id, None, account_id, None, movement_id, transaction_id
    )
    file_out = CRUDFile.read(db, file_id)
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
    movement_id: int,
    transaction_id: int,
    file_id: int,
) -> int:
    CRUDUser.read_transaction(
        db, me.id, None, account_id, None, movement_id, transaction_id
    )
    return CRUDFile.delete(db, file_id)
