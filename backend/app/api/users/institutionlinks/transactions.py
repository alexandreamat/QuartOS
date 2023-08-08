from typing import Iterable
from datetime import date

from fastapi import APIRouter
from sqlalchemy.exc import NoResultFound

from app.database.deps import DBSession

from app.features.user import CurrentSuperuser
from app.features.transaction import (
    TransactionPlaidIn,
    TransactionPlaidOut,
    reset_transaction_to_metadata,
    CRUDSyncableTransaction,
)

from app.features.userinstitutionlink import (
    CRUDUserInstitutionLink,
    CRUDSyncableUserInstitutionLink,
    fetch_transactions,
)
from app.features.account import CRUDAccount


router = APIRouter()


@router.get("/plaid/{start_date}/{end_date}")
def read_transactions_plaid(
    db: DBSession,
    me: CurrentSuperuser,
    userinstitutionlink_id: int,
    start_date: date,
    end_date: date,
) -> Iterable[TransactionPlaidIn]:
    user_institution_link = CRUDSyncableUserInstitutionLink.read(
        db, userinstitutionlink_id
    )
    replacement_pattern = CRUDUserInstitutionLink.read_replacement_pattern(
        db, userinstitutionlink_id
    )
    return fetch_transactions(
        db, user_institution_link, start_date, end_date, replacement_pattern
    )


@router.put("/plaid/reset")
def reset_transactions(
    db: DBSession, me: CurrentSuperuser, userinstitutionlink_id: int
) -> Iterable[TransactionPlaidOut]:
    replacement_pattern = CRUDUserInstitutionLink.read_replacement_pattern(
        db, userinstitutionlink_id
    )
    for t in CRUDSyncableUserInstitutionLink.read_transactions(
        db, userinstitutionlink_id
    ):
        yield reset_transaction_to_metadata(db, t.id, replacement_pattern)
    for a in CRUDSyncableUserInstitutionLink.read_accounts(db, userinstitutionlink_id):
        CRUDAccount.update_balance(db, a.id)


@router.put("/plaid/{transaction_id}/reset")
def reset_transaction(
    db: DBSession,
    me: CurrentSuperuser,
    userinstitutionlink_id: int,
    transaction_id: int,
) -> TransactionPlaidOut:
    rp = CRUDUserInstitutionLink.read_replacement_pattern(db, userinstitutionlink_id)
    return reset_transaction_to_metadata(db, transaction_id, rp)


@router.put("/plaid/resync/{start_date}/{end_date}")
def resync_transactions(
    db: DBSession,
    me: CurrentSuperuser,
    userinstitutionlink_id: int,
    start_date: date,
    end_date: date,
    dry_run: bool = True,
) -> Iterable[TransactionPlaidOut]:
    user_institution_link = CRUDSyncableUserInstitutionLink.read(
        db, userinstitutionlink_id
    )
    replacement_pattern = CRUDUserInstitutionLink.read_replacement_pattern(
        db, userinstitutionlink_id
    )
    for transaction_in in fetch_transactions(
        db, user_institution_link, start_date, end_date, replacement_pattern
    ):
        try:
            transaction_out = CRUDSyncableTransaction.read_by_plaid_id(
                db, transaction_in.plaid_id
            )
        except NoResultFound:
            print(
                f"{transaction_in.plaid_id} not found: {transaction_in.timestamp} - {transaction_in.name} {transaction_in.amount}"
            )
            continue
        transaction_out_dict = transaction_out.dict()
        if dry_run:
            for k, v in transaction_in.dict().items():
                if k == "plaid_metadata":
                    continue
                if transaction_out_dict[k] == v:
                    continue
                print(f"{k}: {transaction_out_dict[k]} -> {v}")
        else:
            yield CRUDSyncableTransaction.update(
                db,
                transaction_out.id,
                transaction_in,
                account_balance=transaction_out.account_balance,
            )