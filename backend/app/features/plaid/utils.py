from app.features.account.models import AccountPlaidOut
from app.features.plaid.client import get_transaction_changes
from app.features.transaction.crud import CRUDTransaction
from app.features.userinstitutionlink.crud import CRUDUserInstitutionLink
from app.features.userinstitutionlink.models import (
    UserInstitutionLinkPlaidIn,
    UserInstitutionLinkPlaidOut,
)


from sqlmodel import Session

from app.features.account.crud import CRUDAccount


def sync_transactions(
    db: Session,
    user_institution_link: UserInstitutionLinkPlaidOut,
) -> None:
    accounts = {
        account.plaid_id: account
        for account in CRUDAccount.read_many_by_institution_link_plaid(
            db, user_institution_link.id
        )
    }
    has_more = True
    while has_more:
        # TODO: Make this atomic
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
        user_institution_link_new = UserInstitutionLinkPlaidIn(
            **user_institution_link.dict()
        )
        CRUDUserInstitutionLink.resync(
            db, user_institution_link.id, user_institution_link_new
        )
        has_more = sync_result.has_more
