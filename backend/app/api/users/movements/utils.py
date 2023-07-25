from fastapi import HTTPException, status

from app.database.deps import DBSession
from app.features.movement import CRUDMovement


def check_user(
    db: DBSession,
    user_id: int,
    movement_id: int,
) -> None:
    if not any(uid == user_id for uid in CRUDMovement.read_user_ids(db, movement_id)):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "The requested movement does not belong to the user",
        )
