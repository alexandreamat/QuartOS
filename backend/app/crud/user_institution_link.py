from sqlalchemy.orm import Session

from app import models, schemas
from .base import CRUDFactory


class CRUDInstitutionFactory(
    CRUDFactory[models.Institution, schemas.InstitutionRead, schemas.InstitutionWrite]
):
    ...


CRUDInstitution = CRUDInstitutionFactory(
    models.Institution, schemas.InstitutionRead, schemas.InstitutionWrite
)
