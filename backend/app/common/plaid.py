import os

import plaid
from plaid.api.plaid_api import PlaidApi
from plaid.model.products import Products
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_response import LinkTokenCreateResponse
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.item_public_token_exchange_request import (
    ItemPublicTokenExchangeRequest,
)
from plaid.model.item_public_token_exchange_response import (
    ItemPublicTokenExchangeResponse,
)
from plaid.model.country_code import CountryCode


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
