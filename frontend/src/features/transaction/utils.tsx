import {
  PaymentChannel,
  TransactionApiIn,
  TransactionApiOut,
  TransactionCode,
} from "app/services/api";
import { TransactionApiInForm } from "./types";

export function transactionApiOutToForm(
  transaction: TransactionApiOut,
  form: TransactionApiInForm
) {
  form.paymentChannel.set(transaction.payment_channel);
  form.code.set(transaction.code);
  // form.relatedTransactionId.set(transaction.related_transaction_id || 0);
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
    code: form.code.value! as TransactionCode,
    payment_channel: form.paymentChannel.value! as PaymentChannel,
    amount: Number(form.amountStr.value!),
    timestamp: form.timestamp.value!.toISOString(),
    name: form.name.value!,
    currency_code: form.currencyCode.value!,
    account_id: form.accountId.value!,
    // related_transaction_id: form.relatedTransactionId.value || undefined,
  };
}
