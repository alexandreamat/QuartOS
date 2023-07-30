from typing import Any, Iterable

from sqlmodel import Session

from app.common.crud import CRUDBase, CRUDSyncedBase
from app.features.account import AccountApiOut, AccountPlaidOut
from app.features.transaction import TransactionPlaidOut

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


class CRUDSyncableUserInstitutionLink(
    CRUDSyncedBase[
        UserInstitutionLink, UserInstitutionLinkPlaidOut, UserInstitutionLinkPlaidIn
    ]
):
    db_model = UserInstitutionLink
    out_model = UserInstitutionLinkPlaidOut

    @classmethod
    def read_accounts(cls, db: Session, id: int) -> Iterable[AccountPlaidOut]:
        uil = UserInstitutionLink.read(db, id)
        for ia in uil.institutionalaccounts:
            yield AccountPlaidOut.from_orm(ia.account)

    @classmethod
    def read_transactions(cls, db: Session, id: int) -> Iterable[TransactionPlaidOut]:
        uil = UserInstitutionLink.read(db, id)
        for ia in uil.institutionalaccounts:
            for t in ia.account.transactions:
                yield TransactionPlaidOut.from_orm(t)
