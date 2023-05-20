from typing import List

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app import models, schemas

from . import CRUDBase


class CRUDInstitution(
    CRUDBase[
        models.Institution,
        schemas.InstitutionCreate,
        schemas.InstitutionRead,
        schemas.InstitutionUpdate,
    ]
):
    def create(
        self,
        db: Session,
        new_schema_obj: schemas.InstitutionCreate,
    ) -> schemas.InstitutionRead:
        db_obj_in = models.Institution(**new_schema_obj.dict())
        db_obj_out = self._insert_or_update(db, db_obj_in)
        return schemas.InstitutionRead.from_orm(db_obj_out)

    def read_or_create(
        self, db: Session, new_schema_obj: schemas.InstitutionCreate
    ) -> schemas.InstitutionRead:
        db_obj = (
            db.query(models.Institution)
            .filter(models.Institution.name == new_schema_obj.name)
            .filter(models.Institution.country_code == new_schema_obj.country_code)
            .first()
        )
        if db_obj:
            return schemas.InstitutionRead.from_orm(db_obj)
        return self.create(db, new_schema_obj=new_schema_obj)


institution = CRUDInstitution(models.Institution, schemas.InstitutionRead)
