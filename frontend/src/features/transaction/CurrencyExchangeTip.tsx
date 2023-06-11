import { TransactionApiOut, api } from "app/services/api";
import { renderCurrency } from "utils/currency";

export default function CurrencyExchangeTip(props: {
  relatedTransaction: TransactionApiOut;
  currencyCode: string;
}) {
  const exchangeRateQuery =
    api.endpoints.getExchangeRateApiExchangerateGet.useQuery({
      fromCurrency: props.relatedTransaction.currency_code,
      toCurrency: props.currencyCode,
      date: props.relatedTransaction.timestamp
        ? props.relatedTransaction.timestamp.split("T")[0]
        : undefined,
    });

  if (!exchangeRateQuery.isSuccess) return <></>;

  return (
    <p>
      Related amount was{" "}
      {renderCurrency(
        Math.abs(props.relatedTransaction.amount),
        props.relatedTransaction.currency_code
      )}{" "}
      ={" "}
      {renderCurrency(
        exchangeRateQuery.data * Math.abs(props.relatedTransaction.amount),
        props.currencyCode
      )}
    </p>
  );
}
