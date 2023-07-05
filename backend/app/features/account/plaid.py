from plaid.model.account_base import AccountBase
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.accounts_get_response import AccountsGetResponse

from app.common.plaid import client
from app.features import userinstitutionlink

from .models import AccountPlaidIn


def fetch_accounts(
    user_institution_link: userinstitutionlink.models.UserInstitutionLinkPlaidOut,
) -> list[AccountPlaidIn]:
    request = AccountsGetRequest(access_token=user_institution_link.access_token)
    response: AccountsGetResponse = client.accounts_get(request)
    accounts: list[AccountBase] = response.accounts
    return [
        AccountPlaidIn(
            institutionalaccount=AccountPlaidIn.InstitutionalAccount(
                plaid_id=account.account_id,
                plaid_metadata=account.to_str(),
                mask=account.mask,
                type=account.type.value,
                userinstitutionlink_id=user_institution_link.id,
            ),
            name=account.name,
            currency_code=account.balances.iso_currency_code,
            initial_balance=account.balances.current,
        )
        for account in accounts
    ]
