import urllib3
from typing import Iterable
from datetime import date

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import NoResultFound

from app.database.deps import DBSession

from app.features.user import CurrentSuperuser, CRUDUser, CurrentUser
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
    sync_transactions as _sync_transactions,
)
from app.features.account import CRUDAccount


router = APIRouter()


@router.get("/{start_date}/{end_date}")
def read(
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


@router.put("/reset")
def reset_many(
    db: DBSession, me: CurrentSuperuser, userinstitutionlink_id: int
) -> Iterable[TransactionPlaidOut]:
    replacement_pattern = CRUDUserInstitutionLink.read_replacement_pattern(
        db, userinstitutionlink_id
    )
    for t in CRUDSyncableUserInstitutionLink.read_transactions(
        db, userinstitutionlink_id
    ):
        yield reset_transaction_to_metadata(db, t.id, replacement_pattern)
    for a in CRUDSyncableUserInstitutionLink.read_syncable_accounts(
        db, userinstitutionlink_id
    ):
        CRUDAccount.update_balance(db, a.id)


@router.put("/{transaction_id}/reset")
def reset(
    db: DBSession,
    me: CurrentSuperuser,
    userinstitutionlink_id: int,
    transaction_id: int,
) -> TransactionPlaidOut:
    rp = CRUDUserInstitutionLink.read_replacement_pattern(db, userinstitutionlink_id)
    return reset_transaction_to_metadata(db, transaction_id, rp)


@router.post("/sync")
def sync(db: DBSession, me: CurrentUser, userinstitutionlink_id: int) -> None:
    institution_link_out = CRUDUser.read_user_institution_link(
        db, me.id, userinstitutionlink_id
    )
    if not institution_link_out.plaid_id:
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED)
    institution_link_plaid_out = CRUDSyncableUserInstitutionLink.read_by_plaid_id(
        db, institution_link_out.plaid_id
    )
    replacement_pattern_out = CRUDUserInstitutionLink.read_replacement_pattern(
        db, institution_link_plaid_out.id
    )
    try:
        _sync_transactions(db, institution_link_plaid_out, replacement_pattern_out)
    except urllib3.exceptions.ReadTimeoutError:
        raise HTTPException(status.HTTP_504_GATEWAY_TIMEOUT)


@router.put("/resync/{start_date}/{end_date}")
def resync(
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
