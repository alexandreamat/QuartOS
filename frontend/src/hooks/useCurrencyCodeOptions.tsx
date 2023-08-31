import { codes } from "currency-codes";

export function useCurrencyCodeOptions() {
  return codes().map((code, index) => ({
    key: index,
    value: code,
    text: code,
  }));
}
