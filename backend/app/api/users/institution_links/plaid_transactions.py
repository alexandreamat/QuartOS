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
from app.crud.replacementpattern import CRUDReplacementPattern

from app.crud.userinstitutionlink import (
    CRUDSyncableUserInstitutionLink,
    CRUDUserInstitutionLink,
)
from app.database.deps import DBSession
from app.deps.user import CurrentUser
from app.plaid.userinstitutionlink import sync_transactions

router = APIRouter()


@router.post("/sync")
def sync(db: DBSession, me: CurrentUser, user_institution_link_id: int) -> None:
    institution_link_plaid_out = CRUDSyncableUserInstitutionLink.read(
        db,
        id=user_institution_link_id,
        user_id=me.id,
    )
    replacement_pattern_out = CRUDReplacementPattern.read(
        db, user_institution_link_id=user_institution_link_id
    )
    try:
        sync_transactions(
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
