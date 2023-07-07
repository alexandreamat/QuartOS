from app.common.crud import CRUDBase, CRUDSyncedBase

from .models import (
    Institution,
    InstitutionApiOut,
    InstitutionApiIn,
    InstitutionPlaidIn,
    InstitutionPlaidOut,
)


class CRUDInstitution(
    CRUDBase[Institution, InstitutionApiOut, InstitutionApiIn],
):
    db_model = Institution
    out_model = InstitutionApiOut


class CRUDSyncableInstitution(
    CRUDSyncedBase[Institution, InstitutionPlaidOut, InstitutionPlaidIn],
):
    db_model = Institution
    out_model = InstitutionPlaidOut
