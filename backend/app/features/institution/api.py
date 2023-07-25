from typing import Iterable

from fastapi import APIRouter, HTTPException, status

from app.features.user.deps import CurrentSuperuser
from app.database.deps import DBSession
from app.api import api_router

from app.features.institution import fetch_institution


from .crud import CRUDInstitution, CRUDSyncableInstitution
from .models import InstitutionApiOut, InstitutionApiIn

INSTITUTIONS = "institutions"

router = APIRouter()


@router.post("/")
def create(
    db: DBSession, current_user: CurrentSuperuser, institution: InstitutionApiIn
) -> InstitutionApiOut:
    """
    Create new institution.
    """
    return CRUDInstitution.create(db, institution)


@router.post("/{id}/sync")
def sync(db: DBSession, current_user: CurrentSuperuser, id: int) -> InstitutionApiOut:
    institution_db = CRUDInstitution.read(db, id=id)
    if not institution_db.plaid_id:
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED)
    institution_in = fetch_institution(institution_db.plaid_id)
    CRUDSyncableInstitution.update(db, id, institution_in)
    institution_out = CRUDInstitution.read(db, id)
    return institution_out


@router.get("/{id}")
def read(db: DBSession, id: int) -> InstitutionApiOut:
    """
    Get institution by ID.
    """
    return CRUDInstitution.read(db, id=id)


@router.get("/")
def read_many(db: DBSession) -> Iterable[InstitutionApiOut]:
    """
    Retrieve institutions.
    """
    return CRUDInstitution.read_many(db, 0, 0)


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
    return CRUDInstitution.update(db, id, institution)


@router.delete("/{id}")
def delete(db: DBSession, current_user: CurrentSuperuser, id: int) -> None:
    """
    Delete an institution.
    """
    CRUDInstitution.delete(db, id=id)


api_router.include_router(router, prefix=f"/{INSTITUTIONS}", tags=[INSTITUTIONS])
