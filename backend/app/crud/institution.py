from sqlalchemy.orm import Session

from app import models, schemas
from .base import CRUDBase


class CRUDInstitution(
    CRUDBase[models.Institution, schemas.InstitutionRead, schemas.InstitutionWrite]
):
    model_type = models.Institution
    read_schema_type = schemas.InstitutionRead
    write_schema_type = schemas.InstitutionWrite
