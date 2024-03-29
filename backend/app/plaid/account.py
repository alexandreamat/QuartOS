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
from decimal import Decimal
from typing import TYPE_CHECKING, Iterable

from plaid.model.account_base import AccountBase
from plaid.model.account_type import AccountType
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.accounts_get_response import AccountsGetResponse

from app.plaid.common import client
from app.schemas.account import (
    AccountPlaidIn,
    CreditPlaidIn,
    DepositoryPlaidIn,
    LoanPlaidIn,
)

if TYPE_CHECKING:
    from app.schemas.userinstitutionlink import UserInstitutionLinkPlaidOut

logger = logging.getLogger(__name__)


def fetch_accounts(
    user_institution_link: "UserInstitutionLinkPlaidOut",
) -> Iterable[AccountPlaidIn]:
    request = AccountsGetRequest(access_token=user_institution_link.access_token)
    response: AccountsGetResponse = client.accounts_get(request)
    logger.info(response.to_str())
    accounts: list[AccountBase] = response.accounts
    for account in accounts:
        assert isinstance(account, AccountBase)
        assert isinstance(account.type, AccountType)
        match account.type.value:
            case "depository":
                yield DepositoryPlaidIn(
                    plaid_id=account.account_id,
                    plaid_metadata=account.to_str(),
                    mask=account.mask or "",
                    type=account.type.value,
                    name=account.name,
                    currency_code=account.balances.iso_currency_code,
                    initial_balance=Decimal(0),
                )
            case "credit":
                yield CreditPlaidIn(
                    plaid_id=account.account_id,
                    plaid_metadata=account.to_str(),
                    type=account.type.value,
                    name=account.name,
                    currency_code=account.balances.iso_currency_code,
                    initial_balance=Decimal(0),
                    mask=account.mask or "",
                )
            case "loan":
                yield LoanPlaidIn(
                    plaid_id=account.account_id,
                    plaid_metadata=account.to_str(),
                    type=account.type.value,
                    name=account.name,
                    currency_code=account.balances.iso_currency_code,
                    initial_balance=Decimal(0),
                    mask=account.mask or "",
                )
