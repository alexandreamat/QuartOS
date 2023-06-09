import { PaymentChannel, TransactionCode } from "app/services/api";
import { capitaliseFirstLetter } from "utils/string";

export const paymentChannelOptions: {
  key: number;
  value: PaymentChannel;
  text: string;
}[] = ["online", "in store", "other"].map((option, index) => ({
  key: index,
  value: option as PaymentChannel,
  text: capitaliseFirstLetter(option),
}));

export const codeOptions: {
  key: number;
  value: TransactionCode;
  text: string;
}[] = [
  "adjustment",
  "atm",
  "bank charge",
  "bill payment",
  "cash",
  "cashback",
  "cheque",
  "direct debit",
  "interest",
  "purchase",
  "standing order",
  "transfer",
  "null",
].map((option, index) => ({
  key: index,
  value: option as TransactionCode,
  text: capitaliseFirstLetter(option),
}));
