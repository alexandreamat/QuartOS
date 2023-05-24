from fastapi import APIRouter, HTTPException, status

from sqlalchemy.exc import NoResultFound

from app.features.user.deps import CurrentUser
from app.database.session import DBSession

from app.features.institution.crud import CRUDInstitution

from .crud import CRUDUserInstitutionLink
from .schemas import (
    UserInstitutionLinkRead,
    UserInstitutionLinkWrite,
    UserInstitutionLinkDB,
)

router = APIRouter()


@router.post("/")
def create(
    db: DBSession,
    current_user: CurrentUser,
    institution_link: UserInstitutionLinkWrite,
) -> UserInstitutionLinkRead:
    try:
        CRUDInstitution.read(db, institution_link.institution_id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    user_institution_link = UserInstitutionLinkDB(
        **institution_link.dict(),
        user_id=current_user.id,
    )
    return CRUDUserInstitutionLink.create(db, user_institution_link)


@router.get("/{id}")
def read(db: DBSession, current_user: CurrentUser, id: int) -> UserInstitutionLinkRead:
    institution_link = CRUDUserInstitutionLink.read(db, id)
    if institution_link.user_id != current_user.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)
    return institution_link


@router.get("/")
def read_many(
    db: DBSession, current_user: CurrentUser
) -> list[UserInstitutionLinkRead]:
    return CRUDUserInstitutionLink.read_many_by_user(db, current_user.id)


@router.put("/{id}")
def update(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    institution_link: UserInstitutionLinkWrite,
) -> UserInstitutionLinkRead:
    curr_institution_link = CRUDUserInstitutionLink.read(db, id)
    if curr_institution_link.user_id != current_user.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)
    new_institution_link = UserInstitutionLinkDB(
        **institution_link.dict(), user_id=current_user.id
    )
    try:
        return CRUDUserInstitutionLink.update(db, id, new_institution_link)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
