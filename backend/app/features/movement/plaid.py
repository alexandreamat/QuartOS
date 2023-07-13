from datetime import date
from typing import Iterable

from sqlmodel import Session
from pydantic import BaseModel

from plaid.model.transaction import Transaction
from plaid.model.transactions_sync_request import TransactionsSyncRequest
from plaid.model.transactions_sync_request_options import TransactionsSyncRequestOptions
from plaid.model.transactions_sync_response import TransactionsSyncResponse

from app.common.plaid import client
from app.features.userinstitutionlink.models import (
    UserInstitutionLinkPlaidOut,
    UserInstitutionLinkPlaidIn,
)
from app.features.userinstitutionlink import CRUDSyncableUserInstitutionLink  # type: ignore[attr-defined]
from app.features.transaction import CRUDSyncableTransaction, TransactionPlaidIn  # type: ignore[attr-defined]
from app.features.userinstitutionlink.plaid import get_account_ids_map
from app.features.transaction.plaid import create_transaction_plaid_in

from .crud import CRUDMovement


class __TransactionsSyncResult(BaseModel):
    added: list[TransactionPlaidIn]
    modified: list[TransactionPlaidIn]
    removed: list[str]
    new_cursor: str
    has_more: bool


def __get_transaction_changes(
    db: Session,
    user_institution_link: UserInstitutionLinkPlaidOut,
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
    accounts = get_account_ids_map(db, user_institution_link.id)
    return __TransactionsSyncResult(
        added=[
            create_transaction_plaid_in(transaction, accounts[transaction.account_id])
            for transaction in response.added
        ],
        modified=[
            create_transaction_plaid_in(transaction, accounts[transaction.account_id])
            for transaction in response.modified
        ],
        removed=[
            removed_transaction.transaction_id
            for removed_transaction in response.removed
        ],
        new_cursor=response.next_cursor,
        has_more=response.has_more,
    )


def sync_transactions(
    db: Session,
    user_institution_link: UserInstitutionLinkPlaidOut,
) -> None:
    has_more = True
    while has_more:
        sync_result = __get_transaction_changes(db, user_institution_link)
        for transaction in sync_result.added:
            CRUDMovement.create_syncable(db, transaction)
        for transaction_in in sync_result.modified:
            db_transaction = CRUDSyncableTransaction.read_by_plaid_id(
                db, transaction_in.plaid_id
            )
            CRUDMovement.update_syncable(
                db, db_transaction.movement_id, db_transaction.id, transaction_in
            )
        for plaid_id in sync_result.removed:
            db_transaction = CRUDSyncableTransaction.read_by_plaid_id(db, plaid_id)
            CRUDMovement.delete_transaction(
                db, db_transaction.movement_id, db_transaction.id
            )
        user_institution_link.cursor = sync_result.new_cursor
        user_institution_link_new = UserInstitutionLinkPlaidIn(
            **user_institution_link.dict()
        )
        CRUDSyncableUserInstitutionLink.update(
            db, user_institution_link.id, user_institution_link_new
        )
        has_more = sync_result.has_more
