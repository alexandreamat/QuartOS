from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from app import schemas, crud

from . import deps

router = APIRouter()


@router.post("/")
def create(
    *,
    db: Session = Depends(deps.get_db),
    institution: schemas.InstitutionCreate,
    current_user: schemas.UserRead = Depends(deps.get_current_user),
) -> schemas.InstitutionRead:
    """
    Create new institution.
    """
    institution_out = crud.institution.create(db, institution)
    return institution_out


@router.get("/{id}")
def read(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> schemas.InstitutionRead:
    """
    Get institution by ID.
    """
    try:
        institution = crud.institution.read(db, id=id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found"
        )
    return institution


@router.get("/")
def read_many(
    db: Session = Depends(deps.get_db),
) -> list[schemas.InstitutionRead]:
    """
    Retrieve institutions.
    """
    return crud.institution.read_multi(db)


@router.put("/{id}")
def update(
    *,
    db: Session = Depends(deps.get_db),
    current_user: schemas.UserRead = Depends(deps.get_current_superuser),
    id: int,
    institution: schemas.InstitutionUpdate,
) -> schemas.InstitutionRead:
    """
    Update an institution.
    """
    try:
        institution_out = crud.institution.update(db, id=id, new_schema_obj=institution)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found"
        )
    return institution_out


@router.delete("/{id}")
def delete(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: schemas.UserRead = Depends(deps.get_current_superuser),
) -> schemas.InstitutionRead:
    """
    Delete an institution.
    """
    try:
        institution = crud.institution.delete(db, id=id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found"
        )
    return institution
