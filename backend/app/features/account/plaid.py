from typing import TYPE_CHECKING, Iterable

from plaid.model.account_base import AccountBase
from plaid.model.account_type import AccountType
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.accounts_get_response import AccountsGetResponse
from plaid.model.auth_get_numbers import AuthGetNumbers
from plaid.model.auth_get_request import AuthGetRequest
from plaid.model.auth_get_response import AuthGetResponse
from plaid.model.numbers_international import NumbersInternational

from app.common.plaid import client
from .models import AccountPlaidIn, CreditPlaidIn, DepositoryPlaidIn, LoanPlaidIn

if TYPE_CHECKING:
    from app.features.userinstitutionlink import UserInstitutionLinkPlaidOut


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
    response = client.accounts_get(request)
    assert isinstance(response, AccountsGetResponse)
    accounts = response.accounts

    numbers = __fetch_auth_numbers(user_institution_link.access_token)

    for account in accounts:
        assert isinstance(account, AccountBase)
        assert isinstance(account.type, AccountType)
        account_type = account.type.value
        match account_type:
            case "depository":
                yield DepositoryPlaidIn(
                    plaid_id=account.account_id,
                    plaid_metadata=account.to_str(),
                    mask=account.mask,
                    type=account.type.value,
                    userinstitutionlink_id=user_institution_link.id,
                    bic=numbers[account.account_id][0],
                    iban=numbers[account.account_id][1],
                    name=account.name,
                    currency_code=account.balances.iso_currency_code,
                    initial_balance=0,
                )
            case "credit":
                yield CreditPlaidIn(
                    plaid_id=account.account_id,
                    plaid_metadata=account.to_str(),
                    mask=account.mask,
                    type=account.type.value,
                    userinstitutionlink_id=user_institution_link.id,
                    name=account.name,
                    currency_code=account.balances.iso_currency_code,
                    initial_balance=0,
                    # number=account.number,
                )
            case "loan":
                yield LoanPlaidIn(
                    plaid_id=account.account_id,
                    plaid_metadata=account.to_str(),
                    mask=account.mask,
                    type=account.type.value,
                    userinstitutionlink_id=user_institution_link.id,
                    name=account.name,
                    currency_code=account.balances.iso_currency_code,
                    initial_balance=0,
                )
