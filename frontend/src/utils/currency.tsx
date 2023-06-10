export function renderCurrency(amount: number, currencyCode: string) {
  return amount.toLocaleString(undefined, {
    style: "currency",
    currency: currencyCode,
  });
}
