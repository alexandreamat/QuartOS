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

import { TransactionGroupApiOut, PlStatement, api } from "app/services/api";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { TransactionCard } from "features/transaction/components/TransactionCard";
import { Card, Loader } from "semantic-ui-react";

export default function PLTransactions(props: {
  plStatement: PlStatement;
  showIncome: boolean;
  onOpenEditForm: (x: TransactionGroupApiOut) => void;
  categoryId?: number;
}) {
  const transactionsQuery =
    api.endpoints.readManyUsersMeTransactionsGet.useQuery({
      timestampGe: props.plStatement.start_date,
      timestampLt: props.plStatement.end_date,
      categoryIdEq: props.categoryId,
      [`amountDefaultCurrency${props.showIncome ? "Gt" : "Lt"}` as const]: 0,
      orderBy: `amount_default_currency__${
        props.showIncome ? "desc" : "asc"
      }` as const,
      consolidated: true,
    });

  if (transactionsQuery.isLoading || transactionsQuery.isUninitialized)
    return <Loader active size="huge" />;

  if (transactionsQuery.isError)
    return <QueryErrorMessage query={transactionsQuery} />;

  const transactions = transactionsQuery.data;

  const totalAmount = props.showIncome
    ? Number(props.plStatement.income)
    : Number(props.plStatement.expenses);

  let cumulativeAmount = 0;

  return (
    <Card.Group style={{ margin: 0 }}>
      {transactions.map((t) => {
        cumulativeAmount += Number(t.amount_default_currency);
        const explanationRate = (cumulativeAmount / totalAmount) * 100;
        if (t.consolidated)
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
