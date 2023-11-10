# Copyright (C) 2023 Alexandre Amat
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

from fastapi import APIRouter

from app.database.deps import DBSession
from app.features.user import CurrentSuperuser
from app.features.replacementpattern import (
    CRUDReplacementPattern,
    ReplacementPatternApiIn,
    ReplacementPatternApiOut,
)


router = APIRouter()


@router.post("/")
def create(
    db: DBSession,
    me: CurrentSuperuser,
    replacement_pattern_in: ReplacementPatternApiIn,
) -> ReplacementPatternApiOut:
    return CRUDReplacementPattern.create(db, replacement_pattern_in)


@router.get("/{id}")
def read(db: DBSession, id: int) -> ReplacementPatternApiOut:
    return CRUDReplacementPattern.read(db, id)


@router.get("/")
def read_many(db: DBSession) -> Iterable[ReplacementPatternApiOut]:
    return CRUDReplacementPattern.read_many(db, 0, 0)


@router.put("/{id}")
def update(
    db: DBSession,
    me: CurrentSuperuser,
    id: int,
    institution_in: ReplacementPatternApiIn,
) -> ReplacementPatternApiOut:
    return CRUDReplacementPattern.update(db, id, institution_in)


@router.delete("/{id}")
def delete(db: DBSession, me: CurrentSuperuser, id: int) -> int:
    return CRUDReplacementPattern.delete(db, id)
