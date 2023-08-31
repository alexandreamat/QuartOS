import { skipToken } from "@reduxjs/toolkit/dist/query";
import { TransactionApiOut, api } from "app/services/api";
import { Label } from "semantic-ui-react";
import { renderCurrency } from "utils/currency";

function CurrencyExchangeTip(props: {
  relatedTransaction: TransactionApiOut;
  currencyCode: string;
}) {
  const accountQuery =
    api.endpoints.readApiUsersMeAccountsAccountIdGet.useQuery(
      props.relatedTransaction.account_id
    );

  const amount = props.relatedTransaction.amount;
  const fromCurrency = accountQuery.data?.currency_code;
  const toCurrency = props.currencyCode;

  const exchangeRateQuery =
    api.endpoints.readExchangeRateApiExchangerateGet.useQuery(
      fromCurrency !== toCurrency && fromCurrency !== undefined
        ? {
            fromCurrency,
            toCurrency,
            date: props.relatedTransaction.timestamp.split("T")[0],
          }
        : skipToken
    );

  if (!fromCurrency) return <Label />;

  return (
    <Label
      circular
      color={amount > 0 ? "green" : amount < 0 ? "orange" : "grey"}
    >
      {renderCurrency(amount, fromCurrency)}
      {toCurrency !== fromCurrency &&
        exchangeRateQuery.isSuccess &&
        ` = ${renderCurrency(exchangeRateQuery.data * amount, toCurrency)}`}
    </Label>
  );
}

export default function CurrencyExchangeTips(props: {
  relatedTransactions: TransactionApiOut[];
  currencyCode: string;
}) {
  return (
    <div style={{ lineHeight: 2 }}>
      Related amounts were{" "}
      {props.relatedTransactions.map((transaction, i) => (
        <CurrencyExchangeTip
          key={transaction.id}
          relatedTransaction={transaction}
          currencyCode={props.currencyCode}
        />
      ))}
    </div>
  );
}
