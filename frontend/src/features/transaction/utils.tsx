import { TransactionApiIn, TransactionApiOut } from "app/services/api";
import { TransactionApiInForm } from "./types";
import { formatDateParam } from "utils/time";

export function transactionApiOutToForm(
  transaction: TransactionApiOut,
  form: TransactionApiInForm
) {
  form.amountStr.set(transaction.amount.toFixed(2));
  form.timestamp.set(
    transaction.timestamp ? new Date(transaction.timestamp) : new Date()
  );
  form.name.set(transaction.name);
  form.accountId.set(transaction.account_id);
  form.currencyCode.set(transaction.currency_code);
}

export function transactionFormToApiIn(
  form: TransactionApiInForm
): TransactionApiIn {
  return {
    amount: Number(form.amountStr.value!),
    timestamp: formatDateParam(form.timestamp.value!),
    name: form.name.value!,
    currency_code: form.currencyCode.value!,
  };
}
