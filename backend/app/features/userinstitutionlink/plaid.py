from typing import TYPE_CHECKING, Iterable
from datetime import date

from sqlmodel import Session

from plaid.model.item import Item
from plaid.model.item_get_request import ItemGetRequest
from plaid.model.item_get_response import ItemGetResponse
from plaid.model.transaction import Transaction
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
from plaid.model.transactions_get_response import TransactionsGetResponse


from app.common.plaid import client
from app.features.institution import InstitutionPlaidOut  # type: ignore[attr-defined]


from .models import UserInstitutionLinkPlaidIn, UserInstitutionLinkPlaidOut

if TYPE_CHECKING:
    from app.features.user import UserApiOut  # type: ignore[attr-defined]
    from app.features.transaction import TransactionPlaidIn  # type: ignore[attr-defined]


def fetch_user_institution_link(
    access_token: str,
    current_user: "UserApiOut",
    institution: InstitutionPlaidOut,
) -> UserInstitutionLinkPlaidIn:
    request = ItemGetRequest(access_token=access_token)
    response: ItemGetResponse = client.item_get(request)
    item: Item = response.item
    user_institution_link_in = UserInstitutionLinkPlaidIn(
        plaid_id=item.item_id,
        institution_id=institution.id,
        user_id=current_user.id,
        access_token=access_token,
        plaid_metadata=item.to_str(),
    )
    return user_institution_link_in


def get_account_ids_map(db: Session, userinstitutionlink_id: int) -> dict[str, int]:
    from app.features.account import CRUDAccount  # type: ignore[attr-defined]

    return {
        account.institutionalaccount.plaid_id: account.id
        for account in CRUDAccount.read_many_by_institution_link_plaid(
            db, userinstitutionlink_id
        )
    }


def get_transactions(
    db: Session,
    user_institution_link: UserInstitutionLinkPlaidOut,
    start_date: date,
    end_date: date,
) -> Iterable["TransactionPlaidIn"]:
    from app.features.transaction.plaid import create_transaction_plaid_in

    accounts = get_account_ids_map(db, user_institution_link.id)
    offset = 0
    total_transactions = 1
    while offset < total_transactions:
        request = TransactionsGetRequest(
            access_token=user_institution_link.access_token,
            start_date=start_date,
            end_date=end_date,
            options=TransactionsGetRequestOptions(
                include_personal_finance_category=True,
                include_logo_and_counterparty_beta=True,
                offset=offset,
            ),
        )
        response: TransactionsGetResponse = client.transactions_get(request)
        total_transactions = response.total_transactions
        transactions: list[Transaction] = response.transactions
        offset += len(transactions)
        for transaction in transactions:
            yield create_transaction_plaid_in(
                transaction, accounts[transaction.account_id]
            )
