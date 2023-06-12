import { TransactionApiOut, api } from "app/services/api";
import { renderCurrency } from "utils/currency";

export default function CurrencyExchangeTip(props: {
  relatedTransaction: TransactionApiOut;
  currencyCode: string;
}) {
  const amount = Math.abs(props.relatedTransaction.amount);
  const fromCurrency = props.relatedTransaction.currency_code;
  const toCurrency = props.currencyCode;

  const exchangeRateQuery =
    api.endpoints.getExchangeRateApiExchangerateGet.useQuery({
      fromCurrency,
      toCurrency,
      date: props.relatedTransaction.timestamp
        ? props.relatedTransaction.timestamp.split("T")[0]
        : undefined,
    });

  if (!exchangeRateQuery.isSuccess) return <></>;

  return (
    <p>
      Related amount was {renderCurrency(amount, fromCurrency)}
      {toCurrency !== fromCurrency &&
        ` = ${renderCurrency(exchangeRateQuery.data * amount, toCurrency)}`}
    </p>
  );
}
