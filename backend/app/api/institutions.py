from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from app import schemas, crud, models

from . import deps

router = APIRouter()


@router.get("/{id}")
def read(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: schemas.UserRead = Depends(deps.get_current_user),
) -> schemas.InstitutionRead:
    """
    Get institution by ID.
    """
    try:
        institution = crud.institution.read(db=db, id=id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found"
        )
    if institution.user_id != current_user.id:
        deps.get_current_superuser(current_user)
    return institution


@router.put("/{id}")
def update(
    *,
    db: Session = Depends(deps.get_db),
    current_user: schemas.UserRead = Depends(deps.get_current_user),
    id: int,
    institution: schemas.InstitutionUpdate,
) -> schemas.InstitutionRead:
    """
    Update an institution.
    """
    try:
        curr_institution = crud.institution.read(db=db, id=id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found"
        )
    if curr_institution.user_id != current_user.id:
        deps.get_current_superuser(current_user)
    institution_out = crud.institution.update(db=db, id=id, new_schema_obj=institution)
    return institution_out


@router.delete("/{id}")
def delete(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: schemas.UserRead = Depends(deps.get_current_user),
) -> schemas.InstitutionRead:
    """
    Delete an institution.
    """
    try:
        curr_institution = crud.institution.read(db=db, id=id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found"
        )
    if curr_institution.user_id != current_user.id:
        deps.get_current_superuser(current_user)
    institution = crud.institution.delete(db=db, id=id)
    return institution


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
    institution_out = crud.institution.read_or_create(db, institution)
    crud.user.update_institutions(db, current_user.id, institution_out)
    return institution_out


@router.get("/")
def read_many(
    db: Session = Depends(deps.get_db),
    current_user: schemas.UserRead = Depends(deps.get_current_user),
) -> list[schemas.InstitutionRead]:
    """
    Retrieve institutions.
    """
    return current_user.institutions
