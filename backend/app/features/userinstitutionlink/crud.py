from sqlmodel import Session
from app.common.crud import CRUDBase

from app.features import user, institution
from . import models


class CRUDUserInstitutionLink(
    CRUDBase[
        models.UserInstitutionLink,
        models.UserInstitutionLinkRead,
        models.UserInstitutionLinkWrite,
    ]
):
    db_model_type = models.UserInstitutionLink
    read_model_type = models.UserInstitutionLinkRead
    write_model_type = models.UserInstitutionLinkWrite

    @classmethod
    def read_many_by_user(
        cls, db: Session, user_id: int
    ) -> list[models.UserInstitutionLinkRead]:
        db_user = user.models.User.read(db, user_id)
        return [cls.read_model_type.from_orm(obj) for obj in db_user.institution_links]

    @classmethod
    def read_user(cls, db: Session, id: int) -> user.models.UserRead:
        return user.models.UserRead.from_orm(cls.db_model_type.read(db, id).user)

    @classmethod
    def read_institution(
        cls, db: Session, id: int
    ) -> institution.models.InstitutionRead:
        return institution.models.InstitutionRead.from_orm(
            cls.db_model_type.read(db, id).institution
        )
