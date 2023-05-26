from app.common.crud import CRUDBase

from . import models


class CRUDInstitution(
    CRUDBase[models.Institution, models.InstitutionRead, models.InstitutionWrite]
):
    db_model_type = models.Institution
    read_model_type = models.InstitutionRead
    write_model_type = models.InstitutionWrite
