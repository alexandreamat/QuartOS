import os
import datetime

from pydantic import BaseModel


import plaid
from plaid.api.plaid_api import PlaidApi
from plaid.model.products import Products
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_response import LinkTokenCreateResponse
from plaid.model.item_get_request import ItemGetRequest
from plaid.model.item_get_response import ItemGetResponse
from plaid.model.institutions_get_by_id_request import InstitutionsGetByIdRequest
from plaid.model.institutions_get_by_id_response import InstitutionsGetByIdResponse
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.transactions_sync_request import TransactionsSyncRequest
from plaid.model.transactions_sync_response import TransactionsSyncResponse
from plaid.model.item_public_token_exchange_request import (
    ItemPublicTokenExchangeRequest,
)
from plaid.model.item_public_token_exchange_response import (
    ItemPublicTokenExchangeResponse,
)
from plaid.model.country_code import CountryCode
from plaid.model.institution import Institution
from plaid.model.item import Item
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.accounts_get_response import AccountsGetResponse
from plaid.model.account_base import AccountBase
from plaid.model.transaction import Transaction


from app.features.institution.models import InstitutionPlaidIn, InstitutionPlaidOut
from app.features.account.models import AccountPlaidIn, AccountPlaidOut
from app.features.transaction.models import TransactionPlaidIn, TransactionPlaidOut
from app.features.user.models import UserApiOut, UserApiIn
from app.features.userinstitutionlink.models import (
    UserInstitutionLinkPlaidIn,
    UserInstitutionLinkPlaidOut,
)

PLAID_CLIENT_ID = os.environ["PLAID_CLIENT_ID"]
PLAID_SECRET = os.environ["PLAID_SECRET"]
PLAID_ENV = os.environ["PLAID_ENV"]
PLAID_PRODUCTS = os.environ["PLAID_PRODUCTS"].split(",")
PLAID_COUNTRY_CODES = os.environ["PLAID_COUNTRY_CODES"].split(",")

match (PLAID_ENV):
    case "sandbox":
        host = plaid.Environment.Sandbox
    case "development":
        host = plaid.Environment.Development
    case "production":
        host = plaid.Environment.Production

configuration = plaid.Configuration(
    host=host,
    api_key={
        "clientId": PLAID_CLIENT_ID,
        "secret": PLAID_SECRET,
        "plaidVersion": "2020-09-14",
    },
)

api_client = plaid.ApiClient(configuration)
client = PlaidApi(api_client)
products = [Products(p) for p in PLAID_PRODUCTS]
country_codes = [CountryCode(cc) for cc in PLAID_COUNTRY_CODES]


class TransactionsSyncResult(BaseModel):
    added: list[TransactionPlaidIn]
    modified: list[TransactionPlaidIn]
    removed: list[str]
    new_cursor: str
    has_more: bool


def create_link_token(user_id: int) -> str:
    request = LinkTokenCreateRequest(
        products=products,
        client_name="QuartOS",
        country_codes=country_codes,
        language="en",
        user=LinkTokenCreateRequestUser(client_user_id=str(user_id)),
    )
    response: LinkTokenCreateResponse = client.link_token_create(request)
    link_token: str = response.link_token
    return link_token


def exchange_public_token(public_token: str) -> str:
    request = ItemPublicTokenExchangeRequest(public_token=public_token)
    response: ItemPublicTokenExchangeResponse = client.item_public_token_exchange(
        request
    )
    access_token: str = response.access_token
    return access_token


def get_user_institution_link(
    access_token: str, current_user: UserApiOut, institution: InstitutionPlaidOut
) -> UserInstitutionLinkPlaidIn:
    request = ItemGetRequest(access_token=access_token)
    response: ItemGetResponse = client.item_get(request)
    item: Item = response.item
    institution_id: str = item.institution_id
    user_institution_link_in = UserInstitutionLinkPlaidIn(
        plaid_id=item.item_id,
        institution_id=institution.id,
        user_id=current_user.id,
        access_token=access_token,
    )
    return user_institution_link_in


def get_institution(plaid_id: str) -> InstitutionPlaidIn:
    request = InstitutionsGetByIdRequest(
        institution_id=plaid_id, country_codes=country_codes
    )
    response: InstitutionsGetByIdResponse = client.institutions_get_by_id(request)
    institution: Institution = response.institution
    return InstitutionPlaidIn(
        name=institution.name,
        country_code=institution.country_codes[0].value,
        plaid_id=institution.institution_id,
        url=institution.url if hasattr(institution, "url") else None,
    )


def get_accounts(
    user_institution_link: UserInstitutionLinkPlaidOut,
) -> list[AccountPlaidIn]:
    request = AccountsGetRequest(access_token=user_institution_link.access_token)
    response: AccountsGetResponse = client.accounts_get(request)
    accounts: list[AccountBase] = response.accounts
    return [
        AccountPlaidIn(
            mask=account.mask,
            name=account.name,
            currency_code=account.balances.iso_currency_code,
            type=account.type.value,
            user_institution_link_id=user_institution_link.id,
            plaid_id=account.account_id,
            balance=account.balances.current,
        )
        for account in accounts
    ]


def create_transaction_plaid_in(
    transaction: Transaction,
    accounts: dict[str, AccountPlaidOut],
) -> TransactionPlaidIn:
    print(transaction)
    return TransactionPlaidIn(
        account_id=accounts[transaction.account_id].id,
        amount=transaction.amount,
        currency_code=getattr(transaction, "iso_currency_code", None)
        or transaction.unofficial_currency_code,
        name=getattr(transaction, "merchant_name", None) or transaction.name,
        plaid_id=transaction.transaction_id,
        datetime=getattr(transaction, "datetime", None)
        or datetime.datetime.combine(transaction.date, datetime.time()),
        payment_channel=transaction.payment_channel,
        code=transaction.transaction_code,
    )


def sync_transactions(
    user_institution_link: UserInstitutionLinkPlaidOut,
    accounts: dict[str, AccountPlaidOut],
) -> TransactionsSyncResult:
    if user_institution_link.cursor:
        request = TransactionsSyncRequest(
            access_token=user_institution_link.access_token,
            cursor=user_institution_link.cursor,
        )
    else:
        request = TransactionsSyncRequest(
            access_token=user_institution_link.access_token,
        )
    response: TransactionsSyncResponse = client.transactions_sync(request)
    return TransactionsSyncResult(
        added=[
            create_transaction_plaid_in(transaction, accounts)
            for transaction in response.added
        ],
        modified=[
            create_transaction_plaid_in(transaction, accounts)
            for transaction in response.modified
        ],
        removed=[
            removed_transaction.transaction_id
            for removed_transaction in response.removed
        ],
        new_cursor=response.next_cursor,
        has_more=response.has_more,
    )
