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
from datetime import date
from typing import Iterable

import sqlalchemy
from plaid.models import (
    ItemWebhookUpdateRequest,
    Item,
    ItemGetRequest,
    ItemGetResponse,
    Transaction,
    TransactionsGetRequest,
    TransactionsGetRequestOptions,
    TransactionsGetResponse,
    TransactionsSyncRequest,
    TransactionsSyncRequestOptions,
    TransactionsSyncResponse,
)
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.crud.account import CRUDAccount, CRUDSyncableAccount
from app.crud.transaction import CRUDSyncableTransaction
from app.crud.userinstitutionlink import CRUDSyncableUserInstitutionLink
from app.plaid.common import client
from app.plaid.transaction import create_transaction_plaid_in
from app.schemas.account import AccountPlaidOut
from app.schemas.replacementpattern import ReplacementPatternApiOut
from app.schemas.transaction import TransactionPlaidIn
from app.schemas.userinstitutionlink import (
    UserInstitutionLinkPlaidIn,
    UserInstitutionLinkPlaidOut,
)

logger = logging.getLogger(__name__)


class __TransactionsSyncResult(BaseModel):
    added: list[tuple[int, TransactionPlaidIn]]
    modified: list[tuple[int, TransactionPlaidIn]]
    removed: list[str]
    new_cursor: str
    has_more: bool


def __get_accounts_map(
    db: Session, user_institution_link_id: int
) -> dict[str, AccountPlaidOut]:
    return {
        account.plaid_id: account
        for account in CRUDSyncableAccount.read_many(
            db, user_institution_link_id=user_institution_link_id
        )
    }


def __fetch_transaction_changes(
    db: Session,
    user_institution_link: UserInstitutionLinkPlaidOut,
    replacement_pattern: ReplacementPatternApiOut | None,
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
    accounts = __get_accounts_map(db, user_institution_link.id)
    return __TransactionsSyncResult(
        added=[
            (
                accounts[transaction.account_id].id,
                create_transaction_plaid_in(
                    db,
                    transaction,
                    replacement_pattern,
                    accounts[transaction.account_id].default_bucket_id,
                ),
            )
            for transaction in response.added
        ],
        modified=[
            (
                accounts[transaction.account_id].id,
                create_transaction_plaid_in(
                    db,
                    transaction,
                    replacement_pattern,
                    accounts[transaction.account_id].default_bucket_id,
                ),
            )
            for transaction in response.modified
        ],
        removed=[
            removed_transaction.transaction_id
            for removed_transaction in response.removed
        ],
        new_cursor=response.next_cursor,
        has_more=response.has_more,
    )


def fetch_user_institution_link(access_token: str) -> UserInstitutionLinkPlaidIn:
    request = ItemGetRequest(access_token=access_token)
    response: ItemGetResponse = client.item_get(request)
    item: Item = response.item
    user_institution_link_in = UserInstitutionLinkPlaidIn(
        plaid_id=item.item_id,
        access_token=access_token,
        plaid_metadata=item.to_str(),
    )
    return user_institution_link_in


def update_item_webhook(access_token: str, webhook_url: str) -> None:
    request = ItemWebhookUpdateRequest(access_token=access_token, webhook=webhook_url)
    client.item_webhook_update(request)


def fetch_transactions(
    db: Session,
    user_institution_link: UserInstitutionLinkPlaidOut,
    start_date: date,
    end_date: date,
    replacement_pattern: ReplacementPatternApiOut | None,
) -> Iterable[TransactionPlaidIn]:
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
            yield create_transaction_plaid_in(db, transaction, replacement_pattern)


def sync_transactions(
    db: Session,
    user_institution_link_out: UserInstitutionLinkPlaidOut,
    replacement_pattern_out: ReplacementPatternApiOut | None,
    default_currency_code: str,
) -> None:
    has_more = True
    while has_more:
        sync_result = __fetch_transaction_changes(
            db, user_institution_link_out, replacement_pattern_out
        )
        for account_id, transaction_in in sync_result.added:
            try:
                CRUDAccount.create_transaction(
                    db,
                    account_id,
                    transaction_in,
                    default_currency_code=default_currency_code,
                )
            except sqlalchemy.exc.IntegrityError:
                logger.warning("Repeated transaction: %s", str(transaction_in))
        for account_id, transaction_in in sync_result.modified:
            transaction_out = CRUDSyncableTransaction.read(
                db, plaid_id=transaction_in.plaid_id
            )
            CRUDAccount.update_transaction(
                db,
                account_id,
                transaction_out.id,
                transaction_in,
                default_currency_code=default_currency_code,
            )
        for plaid_id in sync_result.removed:
            transaction_out = CRUDSyncableTransaction.read(db, plaid_id=plaid_id)
            CRUDSyncableTransaction.delete(db, transaction_out.id)
        user_institution_link_out.cursor = sync_result.new_cursor
        user_institution_link_new = UserInstitutionLinkPlaidIn(
            **user_institution_link_out.model_dump()
        )
        CRUDSyncableUserInstitutionLink.update(
            db, user_institution_link_out.id, user_institution_link_new
        )
        has_more = sync_result.has_more
