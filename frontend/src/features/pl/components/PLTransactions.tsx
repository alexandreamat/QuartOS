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

import {
  TransactionGroupApiOut,
  PlStatementApiOut,
  api,
} from "app/services/api";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { TransactionCard } from "features/transaction/components/TransactionCard";
import { Card, Loader } from "semantic-ui-react";
import { dateToString } from "utils/time";

export default function PLTransactions(props: {
  plStatement: PlStatementApiOut;
  showIncome: boolean;
  onOpenEditForm: (x: TransactionGroupApiOut) => void;
  categoryId?: number;
}) {
  const amountKey = `amountDefaultCurrency${
    props.showIncome ? "Gt" : "Lt"
  }` as const;
  const orderByVal = `amount_default_currency__${
    props.showIncome ? "desc" : "asc"
  }` as const;

  const transactionsQuery =
    api.endpoints.readManyUsersMeTransactionsGet.useQuery({
      timestampGe: dateToString(props.plStatement.timestamp__ge),
      timestampLt: dateToString(props.plStatement.timestamp__lt),
      categoryIdEq: props.categoryId,
      [amountKey]: 0,
      orderBy: orderByVal,
      consolidate: true,
    });

  if (transactionsQuery.isLoading || transactionsQuery.isUninitialized)
    return <Loader active size="huge" />;

  if (transactionsQuery.isError)
    return <QueryErrorMessage query={transactionsQuery} />;

  const transactions = transactionsQuery.data;

  const totalAmount =
    props.plStatement[props.showIncome ? "income" : "expenses"];

  let cumulativeAmount = 0;

  return (
    <Card.Group style={{ margin: 0 }}>
      {transactions.map((t) => {
        cumulativeAmount += t.amount_default_currency;
        const explanationRate = (cumulativeAmount / totalAmount) * 100;
        if (t.is_group)
          return (
            <TransactionCard.Group
              key={t.id}
              transaction={t}
              // explanationRate={explanationRate}
              // hideCategory={props.categoryId !== undefined}
            />
          );
        return (
          <TransactionCard.Simple
            key={t.id}
            transaction={t}
            // explanationRate={explanationRate}
            // hideCategory={props.categoryId !== undefined}
          />
        );
      })}
    </Card.Group>
  );
}
