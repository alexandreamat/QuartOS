from sqlmodel import Session
from app.common.crud import CRUDBase

from app.features import user, institution
from . import model, schemas


class CRUDUserInstitutionLink(
    CRUDBase[
        model.UserInstitutionLink,
        schemas.UserInstitutionLinkRead,
        schemas.UserInstitutionLinkWrite,
    ]
):
    db_model_type = model.UserInstitutionLink
    read_model_type = schemas.UserInstitutionLinkRead
    write_model_type = schemas.UserInstitutionLinkWrite

    @classmethod
    def read_many_by_user(
        cls, db: Session, user_id: int
    ) -> list[schemas.UserInstitutionLinkRead]:
        db_user = user.model.User.read(db, user_id)
        return [cls.read_model_type.from_orm(obj) for obj in db_user.institution_links]

    @classmethod
    def read_user(cls, db: Session, id: int) -> user.schemas.UserRead:
        return user.schemas.UserRead.from_orm(cls.db_model_type.read(db, id).user)

    @classmethod
    def read_institution(
        cls, db: Session, id: int
    ) -> institution.schemas.InstitutionRead:
        return institution.schemas.InstitutionRead.from_orm(
            cls.db_model_type.read(db, id).institution
        )
