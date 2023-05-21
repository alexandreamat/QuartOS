from sqlalchemy.orm import Session

from app import models, schemas


def create(
    db: Session,
    new_schema_obj: schemas.InstitutionWrite,
) -> schemas.InstitutionRead:
    db_obj_in = models.Institution.from_schema(new_schema_obj)
    db_obj_out = models.Institution.create(db, db_obj_in)
    return schemas.InstitutionRead.from_orm(db_obj_out)


def read(db: Session, id: int) -> schemas.InstitutionRead:
    return schemas.InstitutionRead.from_orm(models.Institution.read(db, id))


def read_many(
    db: Session, skip: int = 0, limit: int = 100
) -> list[schemas.InstitutionRead]:
    return [
        schemas.InstitutionRead.from_orm(s)
        for s in models.Institution.read_many(db, skip, limit)
    ]


def update(
    db: Session, id: int, new_schema_obj: schemas.InstitutionWrite
) -> schemas.InstitutionRead:
    db_obj_in = models.Institution.from_schema(new_schema_obj)
    db_obj_out = models.Institution.update(db, id, db_obj_in)
    return schemas.InstitutionRead.from_orm(db_obj_out)


def delete(db: Session, id: int) -> None:
    models.Institution.delete(db, id)
