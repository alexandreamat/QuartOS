# Copyright (C) 2023 Alexandre Amat
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

import datetime  # eval expression might need it
import re
from decimal import Decimal

from sqlmodel import Session

from plaid.model.transaction import Transaction
from plaid.model.counterparty_type import CounterpartyType

from app.features.replacementpattern import ReplacementPatternApiOut

from .models import TransactionPlaidIn, TransactionPlaidOut
from .crud import CRUDSyncableTransaction


def create_transaction_plaid_in(
    transaction: Transaction, replacement_pattern: ReplacementPatternApiOut | None
) -> TransactionPlaidIn:
    if replacement_pattern:
        name = re.sub(
            replacement_pattern.pattern,
            replacement_pattern.replacement,
            transaction.name,
        )
    else:
        name = transaction.name

    return TransactionPlaidIn(
        amount=-transaction.amount,
        name=name,
        plaid_id=transaction.transaction_id,
        timestamp=transaction.date,
        plaid_metadata=transaction.to_str(),
    )


def reset_transaction_to_metadata(
    db: Session, id: int, replacement_pattern: ReplacementPatternApiOut | None
) -> TransactionPlaidOut:
    transaction_out = CRUDSyncableTransaction.read(db, id)
    transaction_plaid = eval(transaction_out.plaid_metadata)
    try:
        for cp in transaction_plaid["counterparties"]:
            cp["type"] = CounterpartyType(cp["type"])
    except KeyError:
        pass
    transaction_in = create_transaction_plaid_in(
        Transaction(**transaction_plaid), replacement_pattern
    )
    return CRUDSyncableTransaction.update(
        db, id, transaction_in, account_balance=Decimal(0)
    )
