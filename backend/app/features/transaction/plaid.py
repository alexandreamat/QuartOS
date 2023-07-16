import datetime  # eval expression might need it

from sqlmodel import Session

from plaid.model.transaction import Transaction
from plaid.model.counterparty_type import CounterpartyType

from .models import TransactionPlaidIn, TransactionPlaidOut
from .crud import CRUDSyncableTransaction


def create_transaction_plaid_in(
    transaction: Transaction,
) -> TransactionPlaidIn:
    return TransactionPlaidIn(
        amount=-transaction.amount,
        currency_code=getattr(transaction, "iso_currency_code", None)
        or transaction.unofficial_currency_code,
        name=getattr(transaction, "merchant_name", None) or transaction.name,
        plaid_id=transaction.transaction_id,
        timestamp=transaction.date,
        plaid_metadata=transaction.to_str(),
    )


def reset_transaction_to_metadata(db: Session, id: int) -> TransactionPlaidOut:
    transaction_out = CRUDSyncableTransaction.read(db, id)
    transaction_plaid = eval(transaction_out.plaid_metadata)
    try:
        for cp in transaction_plaid["counterparties"]:
            cp["type"] = CounterpartyType(cp["type"])
    except KeyError:
        pass
    transaction_in = create_transaction_plaid_in(Transaction(**transaction_plaid))
    return CRUDSyncableTransaction.update(db, id, transaction_in)
