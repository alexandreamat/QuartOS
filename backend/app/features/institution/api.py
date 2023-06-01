from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import NoResultFound

from app.database.deps import DBSession
from app.features.user.deps import CurrentSuperuser

from .crud import CRUDInstitution
from .models import InstitutionApiOut, InstitutionApiIn

router = APIRouter()


@router.post("/")
def create(
    db: DBSession, current_user: CurrentSuperuser, institution: InstitutionApiIn
) -> InstitutionApiOut:
    """
    Create new institution.
    """
    return CRUDInstitution.create(db, institution)


@router.get("/{id}")
def read(db: DBSession, id: int) -> InstitutionApiOut:
    """
    Get institution by ID.
    """
    try:
        return CRUDInstitution.read(db, id=id)
    except NoResultFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


@router.get("/")
def read_many(db: DBSession) -> list[InstitutionApiOut]:
    """
    Retrieve institutions.
    """
    return CRUDInstitution.read_many(db)


@router.put("/{id}")
def update(
    db: DBSession,
    current_user: CurrentSuperuser,
    id: int,
    institution: InstitutionApiIn,
) -> InstitutionApiOut:
    """
    Update an institution.
    """
    try:
        return CRUDInstitution.update(db, id=id, new_schema_obj=institution)
    except NoResultFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


@router.delete("/{id}")
def delete(db: DBSession, current_user: CurrentSuperuser, id: int) -> None:
    """
    Delete an institution.
    """
    try:
        CRUDInstitution.delete(db, id=id)
    except NoResultFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
