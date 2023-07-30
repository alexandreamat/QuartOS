from typing import Iterable

from fastapi import APIRouter, HTTPException, status

from app.database.deps import DBSession

from app.features.user.deps import CurrentSuperuser
from app.features.institution import (
    CRUDInstitution,
    CRUDSyncableInstitution,
    InstitutionApiOut,
    InstitutionApiIn,
    fetch_institution,
)

INSTITUTIONS = "institutions"

router = APIRouter()


@router.post("/")
def create(
    db: DBSession, me: CurrentSuperuser, institution_in: InstitutionApiIn
) -> InstitutionApiOut:
    """
    Create new institution.
    """
    return CRUDInstitution.create(db, institution_in)


@router.post("/{institution_id}/sync")
def sync(db: DBSession, me: CurrentSuperuser, institution_id: int) -> InstitutionApiOut:
    institution_db = CRUDInstitution.read(db, id=institution_id)
    if not institution_db.plaid_id:
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED)
    institution_in = fetch_institution(institution_db.plaid_id)
    CRUDSyncableInstitution.update(db, institution_id, institution_in)
    institution_out = CRUDInstitution.read(db, institution_id)
    return institution_out


@router.get("/{institution_id}")
def read(db: DBSession, institution_id: int) -> InstitutionApiOut:
    """
    Get institution by ID.
    """
    return CRUDInstitution.read(db, id=institution_id)


@router.get("/")
def read_many(db: DBSession) -> Iterable[InstitutionApiOut]:
    """
    Retrieve institutions.
    """
    return CRUDInstitution.read_many(db, 0, 0)


@router.put("/{institution_id}")
def update(
    db: DBSession,
    me: CurrentSuperuser,
    institution_id: int,
    institution_in: InstitutionApiIn,
) -> InstitutionApiOut:
    """
    Update an institution.
    """
    return CRUDInstitution.update(db, institution_id, institution_in)


@router.delete("/{institution_id}")
def delete(db: DBSession, me: CurrentSuperuser, institution_id: int) -> None:
    """
    Delete an institution.
    """
    CRUDInstitution.delete(db, id=institution_id)
