// Copyright (C) 2024 Alexandre Amat
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { skipToken } from "@reduxjs/toolkit/dist/query";
import { TransactionApiOut, api } from "app/services/api";
import { Label } from "semantic-ui-react";
import { renderCurrency } from "utils/currency";

function CurrencyExchangeTip(props: {
  relatedTransaction: TransactionApiOut;
  currencyCode: string;
}) {
  const accountQuery = api.endpoints.readUsersMeAccountsAccountIdGet.useQuery(
    props.relatedTransaction.account_id,
  );

  const amount = Number(props.relatedTransaction.amount);
  const fromCurrency = accountQuery.data?.currency_code;
  const toCurrency = props.currencyCode;

  const exchangeRateQuery =
    api.endpoints.readExchangeRateExchangerateGet.useQuery(
      fromCurrency !== toCurrency && fromCurrency !== undefined
        ? {
            fromCurrency,
            toCurrency,
            date: props.relatedTransaction.timestamp.split("T")[0],
          }
        : skipToken,
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
        ` = ${renderCurrency(
          Number(exchangeRateQuery.data) * amount,
          toCurrency,
        )}`}
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
