from fastapi import APIRouter, HTTPException, status

from sqlalchemy.exc import NoResultFound, IntegrityError

from app.features.user.deps import CurrentUser
from app.database.deps import DBSession

from app.features.institution.crud import CRUDInstitution

from .crud import CRUDUserInstitutionLink
from .schemas import (
    UserInstitutionLinkRead,
    InstitutionLinkWrite,
    UserInstitutionLinkWrite,
)

router = APIRouter()


@router.post("/")
def create(
    db: DBSession,
    current_user: CurrentUser,
    institution_link: InstitutionLinkWrite,
) -> UserInstitutionLinkRead:
    try:
        CRUDInstitution.read(db, institution_link.institution_id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    user_institution_link = UserInstitutionLinkWrite(
        **institution_link.dict(),
        user_id=current_user.id,
    )
    return CRUDUserInstitutionLink.create(db, user_institution_link)


@router.get("/{id}")
def read(db: DBSession, current_user: CurrentUser, id: int) -> UserInstitutionLinkRead:
    institution_link = CRUDUserInstitutionLink.read(db, id)
    if institution_link.user_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
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
    institution_link: InstitutionLinkWrite,
) -> UserInstitutionLinkRead:
    try:
        curr_institution_link = CRUDUserInstitutionLink.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if curr_institution_link.user_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    new_institution_link = UserInstitutionLinkWrite(
        **institution_link.dict(), user_id=current_user.id
    )
    try:
        return CRUDUserInstitutionLink.update(db, id, new_institution_link)
    except IntegrityError:
        raise HTTPException(status.HTTP_404_NOT_FOUND)


@router.delete("/{id}")
def delete(db: DBSession, current_user: CurrentUser, id: int) -> None:
    try:
        curr_institution_link = CRUDUserInstitutionLink.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if curr_institution_link.user_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    CRUDUserInstitutionLink.delete(db, id)
