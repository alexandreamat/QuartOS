from app.common.crud import CRUDBase

from . import schemas, model


class CRUDInstitution(
    CRUDBase[model.Institution, schemas.InstitutionRead, schemas.InstitutionWrite]
):
    db_model_type = model.Institution
    read_model_type = schemas.InstitutionRead
    write_model_type = schemas.InstitutionWrite
