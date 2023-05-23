from app.common.crud import CRUDBase

from . import schemas, model


class CRUDInstitution(
    CRUDBase[model.Institution, schemas.InstitutionRead, schemas.InstitutionWrite]
):
    model_type = model.Institution
    read_schema_type = schemas.InstitutionRead
    write_schema_type = schemas.InstitutionWrite
