from sqlmodel import Session

from app.common.crud import CRUDBase

from .models import Institution, InstitutionRead, InstitutionWrite


class CRUDInstitution(CRUDBase[Institution, InstitutionRead, InstitutionWrite]):
    db_model_type = Institution
    read_model_type = InstitutionRead
    write_model_type = InstitutionWrite

    @classmethod
    def read_by_name(cls, db: Session, name: str) -> InstitutionRead:
        return InstitutionRead.from_orm(cls.db_model_type.read_by_name(db, name))
