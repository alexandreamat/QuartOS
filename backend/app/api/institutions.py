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
    institution: schemas.InstitutionWrite,
    current_user: schemas.UserRead = Depends(deps.get_current_superuser),
) -> schemas.InstitutionRead:
    """
    Create new institution.
    """
    return crud.institution.create(db, institution)


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
        return crud.institution.read(db, id=id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found"
        )


@router.get("/")
def read_many(
    db: Session = Depends(deps.get_db),
) -> list[schemas.InstitutionRead]:
    """
    Retrieve institutions.
    """
    return crud.institution.read_many(db)


@router.put("/{id}")
def update(
    *,
    db: Session = Depends(deps.get_db),
    current_user: schemas.UserRead = Depends(deps.get_current_superuser),
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
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: schemas.UserRead = Depends(deps.get_current_superuser),
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
