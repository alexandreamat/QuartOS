import { TransactionApiOut, api } from "app/services/api";
import { renderCurrency } from "utils/currency";

function CurrencyExchangeTip(props: {
  relatedTransaction: TransactionApiOut;
  currencyCode: string;
}) {
  const amount = props.relatedTransaction.amount;
  const fromCurrency = props.relatedTransaction.currency_code;
  const toCurrency = props.currencyCode;

  const exchangeRateQuery =
    api.endpoints.readExchangeRateApiExchangerateGet.useQuery({
      fromCurrency,
      toCurrency,
      date: props.relatedTransaction.timestamp.split("T")[0],
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

export default function CurrencyExchangeTips(props: {
  relatedTransactions: TransactionApiOut[];
  currencyCode: string;
}) {
  return (
    <>
      {props.relatedTransactions.map((transaction) => (
        <CurrencyExchangeTip
          key={transaction.id}
          relatedTransaction={transaction}
          currencyCode={props.currencyCode}
        />
      ))}
    </>
  );
}
