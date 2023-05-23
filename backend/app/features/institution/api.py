from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import NoResultFound

from app.common.api import deps

from .crud import CRUDInstitution
from .schemas import InstitutionRead, InstitutionWrite


router = APIRouter()


@router.post("/")
def create(
    db: deps.DBSession,
    current_user: deps.CurrentSuperuser,
    institution: InstitutionWrite,
) -> InstitutionRead:
    """
    Create new institution.
    """
    return CRUDInstitution.create(db, institution)


@router.get("/{id}")
def read(db: deps.DBSession, id: int) -> InstitutionRead:
    """
    Get institution by ID.
    """
    try:
        return CRUDInstitution.read(db, id=id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found"
        )


@router.get("/")
def read_many(db: deps.DBSession) -> list[InstitutionRead]:
    """
    Retrieve institutions.
    """
    return CRUDInstitution.read_many(db)


@router.put("/{id}")
def update(
    db: deps.DBSession,
    current_user: deps.CurrentSuperuser,
    id: int,
    institution: InstitutionWrite,
) -> InstitutionRead:
    """
    Update an institution.
    """
    try:
        return CRUDInstitution.update(db, id=id, new_schema_obj=institution)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found"
        )


@router.delete("/{id}")
def delete(
    db: deps.DBSession,
    current_user: deps.CurrentSuperuser,
    id: int,
) -> None:
    """
    Delete an institution.
    """
    try:
        CRUDInstitution.delete(db, id=id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found"
        )
