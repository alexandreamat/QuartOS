from app.common.crud import CRUDBase

from .models import Institution, InstitutionRead, InstitutionWrite


class CRUDInstitution(CRUDBase[Institution, InstitutionRead, InstitutionWrite]):
    db_model_type = Institution
    read_model_type = InstitutionRead
    write_model_type = InstitutionWrite
