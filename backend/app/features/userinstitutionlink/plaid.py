from typing import TYPE_CHECKING, Iterable
from datetime import date

from sqlmodel import Session
from pydantic import BaseModel

from plaid.model.item import Item
from plaid.model.item_get_request import ItemGetRequest
from plaid.model.item_get_response import ItemGetResponse
from plaid.model.transaction import Transaction
from plaid.model.transactions_sync_request import TransactionsSyncRequest
from plaid.model.transactions_sync_request_options import TransactionsSyncRequestOptions
from plaid.model.transactions_sync_response import TransactionsSyncResponse
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
from plaid.model.transactions_get_response import TransactionsGetResponse


from app.common.plaid import client
from app.features.userinstitutionlink import UserInstitutionLinkPlaidOut
from app.features.movement import CRUDMovement
from app.features.transaction import (
    CRUDSyncableTransaction,
    TransactionPlaidIn,
    create_transaction_plaid_in,
)

from .crud import CRUDSyncableUserInstitutionLink
from .models import UserInstitutionLinkPlaidIn, UserInstitutionLinkPlaidOut

if TYPE_CHECKING:
    from app.features.institution import InstitutionPlaidOut
    from app.features.user import UserApiOut


class __TransactionsSyncResult(BaseModel):
    added: list[tuple[int, TransactionPlaidIn]]
    modified: list[tuple[int, TransactionPlaidIn]]
    removed: list[str]
    new_cursor: str
    has_more: bool


def __get_account_ids_map(db: Session, userinstitutionlink_id: int) -> dict[str, int]:
    return {
        account.institutionalaccount.plaid_id: account.id
        for account in CRUDSyncableUserInstitutionLink.read_accounts(
            db, userinstitutionlink_id
        )
    }


def __fetch_transaction_changes(
    db: Session,
    user_institution_link: "UserInstitutionLinkPlaidOut",
) -> __TransactionsSyncResult:
    options = TransactionsSyncRequestOptions(
        include_personal_finance_category=True,
        include_logo_and_counterparty_beta=True,
    )
    if user_institution_link.cursor:
        request = TransactionsSyncRequest(
            access_token=user_institution_link.access_token,
            cursor=user_institution_link.cursor,
            options=options,
        )
    else:
        request = TransactionsSyncRequest(
            access_token=user_institution_link.access_token,
            options=options,
        )
    response: TransactionsSyncResponse = client.transactions_sync(request)
    accounts = __get_account_ids_map(db, user_institution_link.id)
    return __TransactionsSyncResult(
        added=[
            (accounts[transaction.account_id], create_transaction_plaid_in(transaction))
            for transaction in response.added
        ],
        modified=[
            (accounts[transaction.account_id], create_transaction_plaid_in(transaction))
            for transaction in response.modified
        ],
        removed=[
            removed_transaction.transaction_id
            for removed_transaction in response.removed
        ],
        new_cursor=response.next_cursor,
        has_more=response.has_more,
    )


def fetch_user_institution_link(
    access_token: str,
    current_user: "UserApiOut",
    institution: "InstitutionPlaidOut",
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


def fetch_transactions(
    db: Session,
    user_institution_link: UserInstitutionLinkPlaidOut,
    start_date: date,
    end_date: date,
) -> Iterable[TransactionPlaidIn]:
    accounts = __get_account_ids_map(db, user_institution_link.id)
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
            yield create_transaction_plaid_in(transaction)


def sync_transactions(
    db: Session,
    user_institution_link: UserInstitutionLinkPlaidOut,
) -> None:
    has_more = True
    while has_more:
        sync_result = __fetch_transaction_changes(db, user_institution_link)
        for account_id, transaction in sync_result.added:
            CRUDMovement.create_syncable(db, account_id, transaction)
        for account_id, transaction_in in sync_result.modified:
            db_transaction = CRUDSyncableTransaction.read_by_plaid_id(
                db, transaction_in.plaid_id
            )
            CRUDMovement.update_syncable(
                db,
                db_transaction.movement_id,
                db_transaction.id,
                account_id,
                transaction_in,
            )
        for plaid_id in sync_result.removed:
            db_transaction = CRUDSyncableTransaction.read_by_plaid_id(db, plaid_id)
            CRUDMovement.delete_transaction(
                db, db_transaction.movement_id, account_id, db_transaction.id
            )
        user_institution_link.cursor = sync_result.new_cursor
        user_institution_link_new = UserInstitutionLinkPlaidIn(
            **user_institution_link.dict()
        )
        CRUDSyncableUserInstitutionLink.update(
            db, user_institution_link.id, user_institution_link_new
        )
        has_more = sync_result.has_more
