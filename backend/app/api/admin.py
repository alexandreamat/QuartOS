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


from datetime import date
from typing import Iterable

from fastapi import APIRouter
from sqlalchemy.exc import NoResultFound

from app.crud.account import CRUDAccount, CRUDSyncableAccount
from app.crud.institution import CRUDSyncableInstitution
from app.crud.replacementpattern import CRUDReplacementPattern
from app.crud.transaction import CRUDSyncableTransaction, CRUDTransaction
from app.crud.user import CRUDUser
from app.crud.userinstitutionlink import (
    CRUDSyncableUserInstitutionLink,
    CRUDUserInstitutionLink,
)
from app.database.deps import DBSession
from app.deps.user import CurrentSuperuser
from app.plaid.account import fetch_accounts
from app.plaid.category import get_all_plaid_categories
from app.plaid.transaction import (
    reset_transaction_to_metadata as _reset_transaction_to_metadata,
)
from app.plaid.userinstitutionlink import (
    fetch_transactions,
    fetch_user_institution_link,
)
from app.schemas.transaction import TransactionPlaidIn, TransactionPlaidOut
from app.schemas.userinstitutionlink import UserInstitutionLinkPlaidOut

router = APIRouter()


@router.put("/accounts/update-balances")
def accounts_update_balances(db: DBSession, me: CurrentSuperuser) -> None:
    for account in CRUDAccount.read_many(db):
        CRUDAccount.update_balance(db, account.id)


@router.put("/categories/sync")
def cateogries_sync(db: DBSession, me: CurrentSuperuser) -> None:
    get_all_plaid_categories(db)


@router.put("/transactions/orphan-only-children")
def orphan_single_transactions(db: DBSession, me: CurrentSuperuser) -> None:
    CRUDTransaction.orphan_only_children(db)


@router.get("/transactions/{transaction_id}")
def read_transaction(
    db: DBSession, me: CurrentSuperuser, transaction_id: int
) -> TransactionPlaidOut:
    return CRUDSyncableTransaction.read(db, id=transaction_id)


@router.put("/transactions/{transaction_id}")
def update_transaction(
    db: DBSession,
    me: CurrentSuperuser,
    transaction_id: int,
    transaction_in: TransactionPlaidIn,
) -> TransactionPlaidOut:
    return CRUDSyncableTransaction.update(db, transaction_id, transaction_in)


@router.put("/transactions/update-amounts-default-currency")
def update_transactions_amount_default_currency(
    db: DBSession, me: CurrentSuperuser
) -> None:
    for u in CRUDUser.read_many(db):
        for a in CRUDAccount.read_many(db, user_id=u.id):
            CRUDAccount.update_transactions_amount_default_currency(
                db, a.id, u.default_currency_code
            )


@router.put("/userinstitutionlinks/{userinstitutionlink_id}/resync")
def resync_user_institution_link(
    db: DBSession, me: CurrentSuperuser, userinstitutionlink_id: int
) -> UserInstitutionLinkPlaidOut:
    userinstitutionlink_out = CRUDSyncableUserInstitutionLink.read(
        db, id=userinstitutionlink_id
    )
    institution_out = CRUDSyncableInstitution.read(
        db, id=userinstitutionlink_out.institution_id
    )
    userinstitutionlink_in = fetch_user_institution_link(
        userinstitutionlink_out.access_token
    )
    userinstitutionlink_in.cursor = userinstitutionlink_out.cursor
    userinstitutionlink_out = CRUDSyncableUserInstitutionLink.update(
        db,
        userinstitutionlink_out.id,
        userinstitutionlink_in,
        user_id=me.id,
        institution_id=institution_out.id,
    )
    for account_in in fetch_accounts(userinstitutionlink_out):
        account_out = CRUDSyncableAccount.read(db, plaid_id=account_in.plaid_id)
        print(account_out)
        account_out = CRUDSyncableAccount.update(db, account_out.id, account_in)
    return userinstitutionlink_out


@router.put(
    "/userinstitutionlinks/{userinstitutionlink_id}/resync/{start_date}/{end_date}"
)
def resync_transactions(
    db: DBSession,
    me: CurrentSuperuser,
    userinstitutionlink_id: int,
    start_date: date,
    end_date: date,
    dry_run: bool = True,
) -> Iterable[TransactionPlaidOut]:
    user_institution_link = CRUDSyncableUserInstitutionLink.read(
        db, id=userinstitutionlink_id
    )
    replacement_pattern = CRUDReplacementPattern.read(
        db, userinstitutionlink_id=userinstitutionlink_id
    )
    for transaction_in in fetch_transactions(
        db, user_institution_link, start_date, end_date, replacement_pattern
    ):
        try:
            transaction_out = CRUDSyncableTransaction.read(
                db, plaid_id=transaction_in.plaid_id
            )
        except NoResultFound:
            print(
                f"{transaction_in.plaid_id} not found: {transaction_in.timestamp} - {transaction_in.name} {transaction_in.amount}"
            )
            continue
        transaction_out_dict = transaction_out.model_dump()
        if dry_run:
            for k, v in transaction_in.model_dump().items():
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


@router.get(
    "/userinstitutionlinks/{userinstitutionlink_id}/transactions/{start_date}/{end_date}"
)
def read_many(
    db: DBSession,
    me: CurrentSuperuser,
    userinstitutionlink_id: int,
    start_date: date,
    end_date: date,
) -> Iterable[TransactionPlaidIn]:
    user_institution_link = CRUDSyncableUserInstitutionLink.read(
        db, id=userinstitutionlink_id
    )
    replacement_pattern = CRUDReplacementPattern.read(
        db, userinstitutionlink_id=userinstitutionlink_id
    )
    return fetch_transactions(
        db, user_institution_link, start_date, end_date, replacement_pattern
    )


@router.put("/userinstitutionlinks/{userinstitutionlink_id}/reset-to-metadata")
def reset_many_transactions_to_metadata(
    db: DBSession, me: CurrentSuperuser, userinstitutionlink_id: int
) -> Iterable[TransactionPlaidOut]:
    replacement_pattern = CRUDReplacementPattern.read(
        db, userinstitutionlink_id=userinstitutionlink_id
    )
    for t in CRUDSyncableTransaction.read_many(
        db, userinstitutionlink_id=userinstitutionlink_id
    ):
        yield _reset_transaction_to_metadata(db, t.id, replacement_pattern)
    for a in CRUDSyncableAccount.read_many(
        db, userinstitutionlink_id=userinstitutionlink_id
    ):
        CRUDAccount.update_balance(db, a.id)


@router.put(
    "/userinstitutionlinks/{userinstitutionlink_id}/transactions/{transaction_id}/reset-to-metadata"
)
def reset_transaction_to_metadata(
    db: DBSession,
    me: CurrentSuperuser,
    userinstitutionlink_id: int,
    transaction_id: int,
) -> TransactionPlaidOut:
    rp = CRUDReplacementPattern.read(db, userinstitutionlink_id=userinstitutionlink_id)
    return _reset_transaction_to_metadata(db, transaction_id, rp)
