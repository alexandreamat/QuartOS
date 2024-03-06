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

import datetime  # noqa keep for eval
import re
from decimal import Decimal

from plaid.model.counterparty_type import CounterpartyType
from plaid.model.personal_finance_category import PersonalFinanceCategory
from plaid.model.transaction import Transaction
from requests import HTTPError
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from app.crud.category import CRUDSyncableCategory
from app.crud.transaction import CRUDSyncableTransaction
from app.plaid.category import create_category_plaid_in
from app.schemas.replacementpattern import ReplacementPatternApiOut
from app.schemas.transaction import TransactionPlaidIn, TransactionPlaidOut


def create_transaction_plaid_in(
    db: Session,
    transaction: Transaction,
    replacement_pattern: ReplacementPatternApiOut | None,
) -> TransactionPlaidIn:
    if replacement_pattern:
        name = re.sub(
            replacement_pattern.pattern,
            replacement_pattern.replacement,
            transaction.name,
        )
    else:
        name = transaction.name

    try:
        plaid_category: PersonalFinanceCategory = transaction.personal_finance_category
        try:
            category_out = CRUDSyncableCategory.read(
                db, plaid_id=plaid_category.primary
            )
        except NoResultFound:
            try:
                category_in = create_category_plaid_in(
                    plaid_category, transaction.personal_finance_category_icon_url
                )
                category_out = CRUDSyncableCategory.create(db, category_in)
            except HTTPError:
                category_out = None
    except AttributeError:
        category_out = None

    return TransactionPlaidIn(
        amount=-transaction.amount,
        name=name,
        plaid_id=transaction.transaction_id,
        timestamp=getattr(transaction, "authorized_date") or transaction.date,
        plaid_metadata=transaction.to_str(),
        category_id=category_out.id if category_out else None,
    )


def reset_transaction_to_metadata(
    db: Session, id: int, replacement_pattern: ReplacementPatternApiOut | None
) -> TransactionPlaidOut:
    transaction_out = CRUDSyncableTransaction.read(db, id__eq=id)
    transaction_plaid = eval(transaction_out.plaid_metadata)
    try:
        for cp in transaction_plaid["counterparties"]:
            cp["type"] = CounterpartyType(cp["type"])
    except KeyError:
        pass
    transaction_in = create_transaction_plaid_in(
        db, Transaction(**transaction_plaid), replacement_pattern
    )
    return CRUDSyncableTransaction.update(
        db, id, transaction_in, account_balance=Decimal(0)
    )
