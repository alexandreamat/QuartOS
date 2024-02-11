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

import json

import plaid
import urllib3
from fastapi import APIRouter, HTTPException, status

from app.database.deps import DBSession
from app.features.user import CRUDUser, CurrentUser
from app.features.userinstitutionlink import (
    CRUDUserInstitutionLink,
    CRUDSyncableUserInstitutionLink,
    sync_transactions as _sync_transactions,
)

router = APIRouter()


@router.post("/sync")
def sync(db: DBSession, me: CurrentUser, userinstitutionlink_id: int) -> None:
    institution_link_out = CRUDUser.read_user_institution_link(
        db, me.id, userinstitutionlink_id
    )
    if not institution_link_out.plaid_id:
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED)
    institution_link_plaid_out = CRUDSyncableUserInstitutionLink.read_by_plaid_id(
        db, institution_link_out.plaid_id
    )
    replacement_pattern_out = CRUDUserInstitutionLink.read_replacement_pattern(
        db, userinstitutionlink_id
    )
    try:
        _sync_transactions(
            db,
            institution_link_plaid_out,
            replacement_pattern_out,
            me.default_currency_code,
        )
    except urllib3.exceptions.ReadTimeoutError:
        raise HTTPException(status.HTTP_504_GATEWAY_TIMEOUT)
    except plaid.ApiException as e:
        error_code = json.loads(e.body).get("error_code")
        if error_code == "ITEM_LOGIN_REQUIRED":
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail=error_code)
        raise
