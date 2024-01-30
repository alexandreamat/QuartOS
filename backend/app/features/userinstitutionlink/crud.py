# Copyright (C) 2024 Alexandre Amat
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

from typing import Iterable

from sqlalchemy.orm import Session

from app.common.crud import CRUDBase, CRUDSyncedBase
from app.features.account import AccountPlaidOut
from app.features.replacementpattern import ReplacementPatternApiOut
from app.features.transaction import TransactionPlaidOut
from .models import (
    UserInstitutionLink,
)
from .schemas import (
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
        return ReplacementPatternApiOut.model_validate(rp) if rp else None


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
            yield AccountPlaidOut.model_validate(ia.account)

    @classmethod
    def read_transactions(cls, db: Session, id: int) -> Iterable[TransactionPlaidOut]:
        uil = UserInstitutionLink.read(db, id)
        for ia in uil.institutionalaccounts:
            for t in ia.account.transactions:
                if not t.is_synced:
                    continue
                yield TransactionPlaidOut.model_validate(t)
