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

import { MovementApiOut, PlStatement, api } from "app/services/api";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { TransactionCard } from "features/transaction/components/TransactionCard";
import { Card, Loader } from "semantic-ui-react";

export default function PLMovements(props: {
  aggregate: PlStatement;
  showIncome: boolean;
  onOpenEditForm: (x: MovementApiOut) => void;
  categoryId?: number;
}) {
  const transactionsQuery =
    api.endpoints.readManyUsersMeTransactionsGet.useQuery({
      timestampGe: props.aggregate.start_date,
      timestampLe: props.aggregate.end_date,
      categoryIdEq: props.categoryId,
      amountGt: props.showIncome ? 0 : undefined,
      amountLt: props.showIncome ? undefined : 0,
      orderBy: props.showIncome ? "amount__desc" : "amount__asc",
    });

  if (transactionsQuery.isLoading || transactionsQuery.isUninitialized)
    return <Loader active size="huge" />;

  if (transactionsQuery.isError)
    return <QueryErrorMessage query={transactionsQuery} />;

  const transactions = transactionsQuery.data;

  const totalAmount = props.showIncome
    ? Number(props.aggregate.income)
    : Number(props.aggregate.expenses);

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
