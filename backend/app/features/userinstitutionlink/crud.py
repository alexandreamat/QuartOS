from typing import Iterable

from sqlmodel import Session
from app.common.crud import CRUDBase, CRUDSyncedBase

from app.features import user, institution
from .models import (
    UserInstitutionLink,
    UserInstitutionLinkApiOut,
    UserInstitutionLinkApiIn,
    UserInstitutionLinkPlaidIn,
    UserInstitutionLinkPlaidOut,
)


class CRUDUserInstitutionLink(
    CRUDBase[UserInstitutionLink, UserInstitutionLinkApiOut, UserInstitutionLinkApiIn],
):
    db_model = UserInstitutionLink
    out_model = UserInstitutionLinkApiOut

    @classmethod
    def read_many_by_user(
        cls, db: Session, user_id: int
    ) -> Iterable[UserInstitutionLinkApiOut]:
        db_user = user.models.User.read(db, user_id)
        for obj in db_user.institution_links:
            yield cls.out_model.from_orm(obj)

    @classmethod
    def read_user(cls, db: Session, id: int) -> user.models.UserApiOut:
        return user.models.UserApiOut.from_orm(cls.db_model.read(db, id).user)

    @classmethod
    def read_institution(
        cls, db: Session, id: int
    ) -> institution.models.InstitutionApiOut:
        return institution.models.InstitutionApiOut.from_orm(
            cls.db_model.read(db, id).institution
        )


class CRUDSyncableUserInstitutionLink(
    CRUDSyncedBase[
        UserInstitutionLink, UserInstitutionLinkPlaidOut, UserInstitutionLinkPlaidIn
    ]
):
    db_model = UserInstitutionLink
    out_model = UserInstitutionLinkPlaidOut
