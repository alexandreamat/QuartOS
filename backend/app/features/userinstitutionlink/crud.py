from sqlalchemy.orm import Session
from app.common.crud import CRUDBase

from . import model, schemas


class CRUDUserInstitutionLink(
    CRUDBase[
        model.UserInstitutionLink,
        schemas.UserInstitutionLinkRead,
        schemas.UserInstitutionLinkWrite,
    ]
):
    model_type = model.UserInstitutionLink
    read_schema_type = schemas.UserInstitutionLinkRead
    write_schema_type = schemas.UserInstitutionLinkDB

    @classmethod
    def read_many_by_user(
        cls, db: Session, user_id: int
    ) -> list[schemas.UserInstitutionLinkRead]:
        return [
            schemas.UserInstitutionLinkRead.from_orm(obj)
            for obj in db.query(model.UserInstitutionLink)
            .filter(model.UserInstitutionLink.user_id == user_id)
            .all()
        ]
