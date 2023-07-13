from plaid.model.transaction import Transaction

from .models import TransactionPlaidIn


def create_transaction_plaid_in(
    transaction: Transaction,
    account_id: int,
) -> TransactionPlaidIn:
    return TransactionPlaidIn(
        account_id=account_id,
        amount=-transaction.amount,
        currency_code=getattr(transaction, "iso_currency_code", None)
        or transaction.unofficial_currency_code,
        name=getattr(transaction, "merchant_name", None) or transaction.name,
        plaid_id=transaction.transaction_id,
        timestamp=transaction.date,
        plaid_metadata=transaction.to_str(),
    )
