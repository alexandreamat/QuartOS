import datetime

from sqlmodel import Session
from pydantic import BaseModel

from plaid.model.transaction import Transaction
from plaid.model.transactions_sync_request import TransactionsSyncRequest
from plaid.model.transactions_sync_response import TransactionsSyncResponse

from app.common.plaid import client
from app.features.account.models import AccountPlaidOut
from app.features.account.crud import CRUDAccount
from app.features.userinstitutionlink.models import (
    UserInstitutionLinkPlaidOut,
    UserInstitutionLinkPlaidIn,
)
from app.features.userinstitutionlink.crud import CRUDUserInstitutionLink
from app.features.transaction.crud import CRUDTransaction
from app.features.transaction.models import TransactionPlaidIn

from .crud import CRUDMovement


def __create_transaction_plaid_in(
    transaction: Transaction,
    accounts: dict[str, AccountPlaidOut],
) -> TransactionPlaidIn:
    return TransactionPlaidIn(
        account_id=accounts[transaction.account_id].id,
        amount=-transaction.amount,
        currency_code=getattr(transaction, "iso_currency_code", None)
        or transaction.unofficial_currency_code,
        name=getattr(transaction, "merchant_name", None) or transaction.name,
        plaid_id=transaction.transaction_id,
        timestamp=getattr(transaction, "datetime", None)
        or datetime.datetime.combine(transaction.date, datetime.time()),
        payment_channel=transaction.payment_channel,
        code=transaction.transaction_code,
        plaid_metadata=transaction.to_str(),
    )


class __TransactionsSyncResult(BaseModel):
    added: list[TransactionPlaidIn]
    modified: list[TransactionPlaidIn]
    removed: list[str]
    new_cursor: str
    has_more: bool


def __get_transaction_changes(
    user_institution_link: UserInstitutionLinkPlaidOut,
    accounts: dict[str, AccountPlaidOut],
) -> __TransactionsSyncResult:
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
    return __TransactionsSyncResult(
        added=[
            __create_transaction_plaid_in(transaction, accounts)
            for transaction in response.added
        ],
        modified=[
            __create_transaction_plaid_in(transaction, accounts)
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
    accounts = {
        account.institutionalaccount.plaid_id: account
        for account in CRUDAccount.read_many_by_institution_link_plaid(
            db, user_institution_link.id
        )
    }
    has_more = True
    while has_more:
        sync_result = __get_transaction_changes(user_institution_link, accounts)
        for transaction in sync_result.added:
            CRUDMovement.sync(db, transaction)
        for transaction_in in sync_result.modified:
            db_transaction = CRUDTransaction.read_by_plaid_id(
                db, transaction_in.plaid_id
            )
            CRUDMovement.resync_transaction(
                db, db_transaction.movement_id, db_transaction.id, transaction_in
            )
        for plaid_id in sync_result.removed:
            db_transaction = CRUDTransaction.read_by_plaid_id(db, plaid_id)
            CRUDMovement.delete_transaction(
                db, db_transaction.movement_id, db_transaction.id
            )
        user_institution_link.cursor = sync_result.new_cursor
        user_institution_link_new = UserInstitutionLinkPlaidIn(
            **user_institution_link.dict()
        )
        CRUDUserInstitutionLink.resync(
            db, user_institution_link.id, user_institution_link_new
        )
        has_more = sync_result.has_more
