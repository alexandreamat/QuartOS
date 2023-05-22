from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import NoResultFound
from app import schemas, crud

from . import deps

router = APIRouter()


@router.post("/")
def create(
    db: deps.DBSession,
    current_user: deps.CurrentSuperuser,
    institution: schemas.InstitutionWrite,
) -> schemas.InstitutionRead:
    """
    Create new institution.
    """
    return crud.institution.create(db, institution)


@router.get("/{id}")
def read(db: deps.DBSession, id: int) -> schemas.InstitutionRead:
    """
    Get institution by ID.
    """
    try:
        return crud.institution.read(db, id=id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found"
        )


@router.get("/")
def read_many(db: deps.DBSession) -> list[schemas.InstitutionRead]:
    """
    Retrieve institutions.
    """
    return crud.institution.read_many(db)


@router.put("/{id}")
def update(
    db: deps.DBSession,
    current_user: deps.CurrentSuperuser,
    id: int,
    institution: schemas.InstitutionWrite,
) -> schemas.InstitutionRead:
    """
    Update an institution.
    """
    try:
        return crud.institution.update(db, id=id, new_schema_obj=institution)
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
        crud.institution.delete(db, id=id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found"
        )
