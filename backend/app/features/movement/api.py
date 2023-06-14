from fastapi import APIRouter


from app.features.user.deps import CurrentUser
from app.database.deps import DBSession


from .models import MovementApiOut
from .crud import CRUDMovement


router = APIRouter()


@router.get("/")
def read_many(
    db: DBSession,
    current_user: CurrentUser,
    page: int = 1,
    per_page: int = 0,
    search: str | None = None,
) -> list[MovementApiOut]:
    return CRUDMovement.read_many_by_user(db, current_user.id, page, per_page, search)
