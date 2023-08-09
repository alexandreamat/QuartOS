from typing import Any, Iterable

from sqlmodel import Session

from app.common.crud import CRUDBase, CRUDSyncedBase
from app.features.replacementpattern import ReplacementPatternApiOut
from app.features.account import AccountPlaidOut
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

    @classmethod
    def read_replacement_pattern(
        cls, db: Session, id: int
    ) -> ReplacementPatternApiOut | None:
        rp = UserInstitutionLink.read(db, id).institution.replacementpattern
        return ReplacementPatternApiOut.from_orm(rp) if rp else None


class CRUDSyncableUserInstitutionLink(
    CRUDSyncedBase[
        UserInstitutionLink, UserInstitutionLinkPlaidOut, UserInstitutionLinkPlaidIn
    ]
):
    db_model = UserInstitutionLink
    out_model = UserInstitutionLinkPlaidOut

    @classmethod
    def read_syncable_accounts(cls, db: Session, id: int) -> Iterable[AccountPlaidOut]:
        uil = UserInstitutionLink.read(db, id)
        for ia in uil.institutionalaccounts:
            if not ia.plaid_id:
                continue
            yield AccountPlaidOut.from_orm(ia.account)

    @classmethod
    def read_transactions(cls, db: Session, id: int) -> Iterable[TransactionPlaidOut]:
        uil = UserInstitutionLink.read(db, id)
        for ia in uil.institutionalaccounts:
            for t in ia.account.transactions:
                yield TransactionPlaidOut.from_orm(t)
