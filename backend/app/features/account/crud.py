from sqlalchemy.orm import Session
from app.common.crud import CRUDBase

from app.features import userinstitutionlink, user, institution
from . import model, schemas


class CRUDAccount(
    CRUDBase[
        model.Account,
        schemas.AccountRead,
        schemas.AccountWrite,
    ]
):
    model_type = model.Account
    read_schema_type = schemas.AccountRead
    write_schema_type = schemas.AccountWrite

    @classmethod
    def read_user(cls, db: Session, id: int) -> user.schemas.UserRead:
        return user.schemas.UserRead.from_orm(cls.model_type.read(db, id).user)

    @classmethod
    def read_institution(
        cls, db: Session, id: int
    ) -> institution.schemas.InstitutionRead:
        return institution.schemas.InstitutionRead.from_orm(
            cls.model_type.read(db, id).institution
        )

    @classmethod
    def read_many_by_institution_link(
        cls, db: Session, user_institution_link: int
    ) -> list[schemas.AccountRead]:
        l = userinstitutionlink.model.UserInstitutionLink.read(
            db, user_institution_link
        )
        return [cls.read_schema_type.from_orm(a) for a in l.accounts]

    @classmethod
    def read_many_by_user(cls, db: Session, user_id: int) -> list[schemas.AccountRead]:
        db_user = user.model.User.read(db, user_id)
        return [
            cls.read_schema_type.from_orm(a)
            for l in db_user.institution_links
            for a in l.accounts
        ]
