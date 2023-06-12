import datetime

from pydantic import BaseModel
from sqlmodel import Session

from plaid.model.transaction import Transaction
from plaid.model.transactions_sync_request import TransactionsSyncRequest
from plaid.model.transactions_sync_response import TransactionsSyncResponse

from app.features.plaid.client import client
from app.features import account, userinstitutionlink

from .models import TransactionPlaidIn
from .crud import CRUDTransaction


def create_transaction_plaid_in(
    transaction: Transaction,
    accounts: dict[str, account.models.AccountPlaidOut],
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


class TransactionsSyncResult(BaseModel):
    added: list[TransactionPlaidIn]
    modified: list[TransactionPlaidIn]
    removed: list[str]
    new_cursor: str
    has_more: bool


def get_transaction_changes(
    user_institution_link: userinstitutionlink.models.UserInstitutionLinkPlaidOut,
    accounts: dict[str, account.models.AccountPlaidOut],
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


def sync_transactions(
    db: Session,
    user_institution_link: userinstitutionlink.models.UserInstitutionLinkPlaidOut,
) -> None:
    accounts = {
        account.institutionalaccount.plaid_id: account
        for account in account.crud.CRUDAccount.read_many_by_institution_link_plaid(
            db, user_institution_link.id
        )
    }
    has_more = True
    while has_more:
        sync_result = get_transaction_changes(user_institution_link, accounts)
        for transaction in sync_result.added:
            CRUDTransaction.sync(db, transaction)
        for transaction_in in sync_result.modified:
            db_transaction = CRUDTransaction.read_by_plaid_id(
                db, transaction_in.plaid_id
            )
            CRUDTransaction.resync(db, db_transaction.id, transaction_in)
        for plaid_id in sync_result.removed:
            db_transaction = CRUDTransaction.read_by_plaid_id(db, plaid_id)
            CRUDTransaction.delete(db, db_transaction.id)
        user_institution_link.cursor = sync_result.new_cursor
        user_institution_link_new = (
            userinstitutionlink.models.UserInstitutionLinkPlaidIn(
                **user_institution_link.dict()
            )
        )
        userinstitutionlink.crud.CRUDUserInstitutionLink.resync(
            db, user_institution_link.id, user_institution_link_new
        )
        has_more = sync_result.has_more
