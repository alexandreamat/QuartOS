# Copyright (C) 2024 Alexandre Amat
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

from typing import Iterable

from fastapi import APIRouter, HTTPException, status

from app.crud.institution import CRUDInstitution, CRUDSyncableInstitution
from app.database.deps import DBSession
from app.deps.user import CurrentSuperuser
from app.plaid.institution import fetch_institution
from app.schemas.institution import InstitutionApiIn, InstitutionApiOut

INSTITUTIONS = "institutions"

router = APIRouter()


@router.post("/")
def create(
    db: DBSession,
    me: CurrentSuperuser,
    institution_in: InstitutionApiIn,
    transactiondeserialiser_id: int | None = None,
    replacementpattern_id: int | None = None,
) -> InstitutionApiOut:
    return CRUDInstitution.create(
        db,
        institution_in,
        transactiondeserialiser_id=transactiondeserialiser_id,
        replacementpattern_id=replacementpattern_id,
    )


@router.get("/{institution_id}")
def read(db: DBSession, institution_id: int) -> InstitutionApiOut:
    return CRUDInstitution.read(db, id=institution_id)


@router.get("/")
def read_many(db: DBSession) -> Iterable[InstitutionApiOut]:
    return CRUDInstitution.read_many(db)


@router.put("/{institution_id}/sync")
def sync(db: DBSession, me: CurrentSuperuser, institution_id: int) -> InstitutionApiOut:
    institution_db = CRUDInstitution.read(db, id=institution_id)
    if not institution_db.plaid_id:
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED)
    institution_in = fetch_institution(institution_db.plaid_id)
    CRUDSyncableInstitution.update(db, institution_id, institution_in)
    institution_out = CRUDInstitution.read(db, institution_id)
    return institution_out


@router.put("/{institution_id}")
def update(
    db: DBSession,
    me: CurrentSuperuser,
    institution_id: int,
    institution_in: InstitutionApiIn,
    transactiondeserialiser_id: int | None = None,
    replacementpattern_id: int | None = None,
) -> InstitutionApiOut:
    return CRUDInstitution.update(
        db,
        institution_id,
        institution_in,
        transactiondeserialiser_id=transactiondeserialiser_id,
        replacementpattern_id=replacementpattern_id,
    )


@router.delete("/{institution_id}")
def delete(db: DBSession, me: CurrentSuperuser, institution_id: int) -> int:
    return CRUDInstitution.delete(db, id=institution_id)
