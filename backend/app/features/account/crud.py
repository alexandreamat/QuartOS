from sqlmodel import Session
from app.common.crud import CRUDBase

from app.features import user, institution

from . import models


class CRUDAccount(
    CRUDBase[
        models.Account,
        models.AccountRead,
        models.AccountWrite,
    ]
):
    db_model_type = models.Account
    read_model_type = models.AccountRead
    write_model_type = models.AccountWrite

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

    @classmethod
    def read_many_by_institution_link(
        cls, db: Session, user_institution_link: int
    ) -> list[models.AccountRead]:
        l = models.UserInstitutionLink.read(db, user_institution_link)
        return [cls.read_model_type.from_orm(a) for a in l.accounts]

    @classmethod
    def read_many_by_user(cls, db: Session, user_id: int) -> list[models.AccountRead]:
        db_user = models.User.read(db, user_id)
        return [
            cls.read_model_type.from_orm(a)
            for l in db_user.institution_links
            for a in l.accounts
        ]
