from typing import Iterable

from sqlmodel import Session

from app.common.crud import CRUDBase, CRUDSyncedBase
from app.features.account import AccountApiOut, AccountPlaidOut

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
    def read_user_id(cls, db: Session, id: int) -> int:
        return cls.db_model.read(db, id).user.id

    @classmethod
    def read_accounts(
        cls, db: Session, userinstitutionlink_id: int
    ) -> Iterable[AccountApiOut]:
        l = UserInstitutionLink.read(db, userinstitutionlink_id)
        for ia in l.institutionalaccounts:
            yield AccountApiOut.from_orm(ia.account)


class CRUDSyncableUserInstitutionLink(
    CRUDSyncedBase[
        UserInstitutionLink, UserInstitutionLinkPlaidOut, UserInstitutionLinkPlaidIn
    ]
):
    db_model = UserInstitutionLink
    out_model = UserInstitutionLinkPlaidOut

    @classmethod
    def read_accounts(
        cls, db: Session, userinstitutionlink_id: int
    ) -> Iterable[AccountPlaidOut]:
        l = UserInstitutionLink.read(db, userinstitutionlink_id)
        for ia in l.institutionalaccounts:
            yield AccountPlaidOut.from_orm(ia.account)
