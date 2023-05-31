from sqlmodel import Session

from app.common.crud import CRUDBase, CRUDSyncable

from .models import Institution, InstitutionRead, InstitutionWrite, InstitutionSync


class CRUDInstitution(
    CRUDBase[Institution, InstitutionRead, InstitutionWrite],
    CRUDSyncable[Institution, InstitutionRead, InstitutionSync],
):
    db_model_type = Institution
    read_model_type = InstitutionRead
    write_model_type = InstitutionWrite

    @classmethod
    def read_by_plaid_id(cls, db: Session, name: str) -> InstitutionRead:
        return InstitutionRead.from_orm(cls.db_model_type.read_by_plaid_id(db, name))
