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

from .crud import CRUDUserInstitutionLink, CRUDSyncableUserInstitutionLink
from .exceptions import (
    SyncedEntity,
    ForbiddenUserInstitutionLink,
)
from .models import (
    UserInstitutionLink,
    UserInstitutionLinkApiIn,
    UserInstitutionLinkApiOut,
    UserInstitutionLinkPlaidIn,
    UserInstitutionLinkPlaidOut,
)
from .plaid import fetch_user_institution_link, fetch_transactions, sync_transactions

__all__ = [
    "CRUDUserInstitutionLink",
    "CRUDSyncableUserInstitutionLink",
    "UserInstitutionLink",
    "UserInstitutionLinkApiIn",
    "UserInstitutionLinkApiOut",
    "UserInstitutionLinkPlaidIn",
    "UserInstitutionLinkPlaidOut",
    "fetch_user_institution_link",
    "fetch_transactions",
    "sync_transactions",
    "SyncedEntity",
    "ForbiddenUserInstitutionLink",
]
