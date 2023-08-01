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
def delete(db: DBSession, me: CurrentSuperuser, id: int) -> None:
    CRUDReplacementPattern.delete(db, id)
