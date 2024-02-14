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

from app.database.deps import DBSession
from app.features.account.crud import CRUDAccount, CRUDSyncableAccount
from app.features.account.plaid import fetch_accounts
from app.features.category.plaid import get_all_plaid_categories
from app.features.institution.crud import CRUDSyncableInstitution
from app.features.transaction.crud import CRUDSyncableTransaction, CRUDTransaction
from app.features.transaction.plaid import (
    reset_transaction_to_metadata as _reset_transaction_to_metadata,
)
from app.features.transaction.schemas import TransactionPlaidIn, TransactionPlaidOut
from app.features.user import CurrentSuperuser
from app.features.user.crud import CRUDUser
from app.features.userinstitutionlink.crud import (
    CRUDSyncableUserInstitutionLink,
    CRUDUserInstitutionLink,
)
from app.features.userinstitutionlink.plaid import (
    fetch_transactions,
    fetch_user_institution_link,
)
from app.features.userinstitutionlink.schemas import UserInstitutionLinkPlaidOut

router = APIRouter()


@router.put("/accounts/update-balances")
def accounts_update_balances(db: DBSession, me: CurrentSuperuser) -> None:
    for account in CRUDAccount.read_many(db, 0, 0):
        CRUDAccount.update_balance(db, account.id)


@router.put("/categories/sync")
def cateogries_sync(db: DBSession, me: CurrentSuperuser) -> None:
    get_all_plaid_categories(db)


@router.put("/transactions/orphan-only-children")
def orphan_single_transactions(db: DBSession, me: CurrentSuperuser) -> None:
    CRUDTransaction.orphan_only_children(db)


@router.get("/transactions/{transactions_id}")
def read_transaction(
    db: DBSession, me: CurrentSuperuser, transactions_id: int
) -> TransactionPlaidOut:
    return CRUDSyncableTransaction.read(db, transactions_id)


@router.put("/transactions/{transactions_id}")
def update_transaction(
    db: DBSession,
    me: CurrentSuperuser,
    transactions_id: int,
    transaction_in: TransactionPlaidIn,
) -> TransactionPlaidOut:
    return CRUDSyncableTransaction.update(db, transactions_id, transaction_in)


@router.put("/transactions/update-amounts-default-currency")
def update_transactions_amount_default_currency(
    db: DBSession, me: CurrentSuperuser
) -> None:
    for u in CRUDUser.read_many(db, 0, 0):
        for a in CRUDUser.read_accounts(db, u.id, None):
            CRUDAccount.update_transactions_amount_default_currency(
                db, a.id, u.default_currency_code
            )


@router.put("/userinstitutionlinks/{userinstitutionlink_id}/resync")
def resync_user_institution_link(
    db: DBSession, me: CurrentSuperuser, userinstitutionlink_id: int
) -> UserInstitutionLinkPlaidOut:
    userinstitutionlink_out = CRUDSyncableUserInstitutionLink.read(
        db, userinstitutionlink_id
    )
    institution_out = CRUDSyncableInstitution.read(
        db, userinstitutionlink_out.institution_id
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
        account_out = CRUDSyncableAccount.read_by_plaid_id(db, account_in.plaid_id)
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
        db, userinstitutionlink_id
    )
    replacement_pattern = CRUDUserInstitutionLink.read_replacement_pattern(
        db, userinstitutionlink_id
    )
    return fetch_transactions(
        db, user_institution_link, start_date, end_date, replacement_pattern
    )


@router.put("/userinstitutionlinks/{userinstitutionlink_id}/reset-to-metadata")
def reset_many_transactions_to_metadata(
    db: DBSession, me: CurrentSuperuser, userinstitutionlink_id: int
) -> Iterable[TransactionPlaidOut]:
    replacement_pattern = CRUDUserInstitutionLink.read_replacement_pattern(
        db, userinstitutionlink_id
    )
    for t in CRUDSyncableUserInstitutionLink.read_transactions(
        db, userinstitutionlink_id
    ):
        yield _reset_transaction_to_metadata(db, t.id, replacement_pattern)
    for a in CRUDSyncableUserInstitutionLink.read_syncable_accounts(
        db, userinstitutionlink_id
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
    rp = CRUDUserInstitutionLink.read_replacement_pattern(db, userinstitutionlink_id)
    return _reset_transaction_to_metadata(db, transaction_id, rp)
