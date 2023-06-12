from app.common.crud import CRUDBase, CRUDSyncable

from .models import (
    Institution,
    InstitutionApiOut,
    InstitutionApiIn,
    InstitutionPlaidIn,
    InstitutionPlaidOut,
)


class CRUDInstitution(
    CRUDBase[Institution, InstitutionApiOut, InstitutionApiIn],
    CRUDSyncable[Institution, InstitutionPlaidOut, InstitutionPlaidIn],
):
    db_model = Institution
    api_out_model = InstitutionApiOut
    plaid_out_model = InstitutionPlaidOut
