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

from typing import Any, Iterable

from sqlalchemy import Select
from sqlalchemy.orm import Session

from app.crud.account import CRUDSyncableAccount
from app.crud.common import CRUDBase, CRUDSyncedBase
from app.models.user import User
from app.models.userinstitutionlink import (
    UserInstitutionLink,
)
from app.schemas.account import AccountPlaidOut
from app.schemas.replacementpattern import ReplacementPatternApiOut
from app.schemas.userinstitutionlink import (
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
    def select(
        cls, *, user_id: int | None = None, **kwargs: Any
    ) -> Select[tuple[UserInstitutionLink]]:
        statement = super().select(**kwargs)
        statement = statement.join(User)
        if user_id:
            statement = statement.where(User.id == user_id)
        return statement

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
            yield CRUDSyncableAccount.model_validate(ia)
