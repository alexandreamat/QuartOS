from sqlmodel import Session

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

    @classmethod
    def read_by_plaid_id(cls, db: Session, name: str) -> InstitutionPlaidOut:
        return cls.plaid_out_model.from_orm(cls.db_model.read_by_plaid_id(db, name))
