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


def __fetch_auth_numbers(access_token: str) -> dict[str, tuple[str, str]]:
    request = AuthGetRequest(access_token=access_token)
    response: AuthGetResponse = client.auth_get(request)
    numbers: AuthGetNumbers = response.numbers
    international: list[NumbersInternational] = numbers.international
    return {number.account_id: (number.bic, number.iban) for number in international}


def fetch_accounts(
    user_institution_link: "UserInstitutionLinkPlaidOut",
) -> Iterable[AccountPlaidIn]:
    request = AccountsGetRequest(access_token=user_institution_link.access_token)
    response: AccountsGetResponse = client.accounts_get(request)
    logger.info(response.to_str())
    accounts: list[AccountBase] = response.accounts

    numbers = __fetch_auth_numbers(user_institution_link.access_token)

    for account in accounts:
        try:
            bic = numbers[account.account_id][0]
            iban = numbers[account.account_id][1]
        except:
            bic = None
            iban = None
        yield AccountPlaidIn(
            institutionalaccount=AccountPlaidIn.InstitutionalAccount(
                plaid_id=account.account_id,
                plaid_metadata=account.to_str(),
                mask=account.mask or "",
                type=account.type.value,
                userinstitutionlink_id=user_institution_link.id,
                bic=bic,
                iban=iban,
            ),
            name=account.name,
            currency_code=account.balances.iso_currency_code,
            initial_balance=0,
        )
