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

import logging
from typing import TYPE_CHECKING, Iterable

from plaid.model.account_base import AccountBase
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.accounts_get_response import AccountsGetResponse
from plaid.model.auth_get_request import AuthGetRequest
from plaid.model.auth_get_response import AuthGetResponse
from plaid.model.auth_get_numbers import AuthGetNumbers
from plaid.model.numbers_international import NumbersInternational

from app.common.plaid import client

from .models import AccountPlaidIn

if TYPE_CHECKING:
    from app.features.userinstitutionlink import UserInstitutionLinkPlaidOut

logger = logging.getLogger(__name__)


def fetch_accounts(
    user_institution_link: "UserInstitutionLinkPlaidOut",
) -> Iterable[AccountPlaidIn]:
    request = AccountsGetRequest(access_token=user_institution_link.access_token)
    response: AccountsGetResponse = client.accounts_get(request)
    logger.info(response.to_str())
    accounts: list[AccountBase] = response.accounts

    for account in accounts:
        yield AccountPlaidIn(
            institutionalaccount=AccountPlaidIn.InstitutionalAccount(
                plaid_id=account.account_id,
                plaid_metadata=account.to_str(),
                mask=account.mask or "",
                type=account.type.value,
                userinstitutionlink_id=user_institution_link.id,
            ),
            name=account.name,
            currency_code=account.balances.iso_currency_code,
            initial_balance=0,
        )
