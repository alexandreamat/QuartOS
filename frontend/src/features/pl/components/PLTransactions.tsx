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
  api,
  DetailedPlStatementApiOut,
  ConsolidatedTransaction,
} from "app/services/api";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { TransactionCard } from "features/transaction/components/TransactionCard";
import { Card, Loader } from "semantic-ui-react";
import { dateToString } from "utils/time";

export default function PLTransactions(props: {
  plStatement: DetailedPlStatementApiOut;
  showIncome: boolean;
  onOpenEditForm: (x: TransactionGroupApiOut) => void;
  categoryId?: number;
  bucketId?: number;
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
      categoryIdEq: props.categoryId ? props.categoryId : undefined,
      categoryIdIsNull: props.categoryId === 0 ? true : undefined,
      [amountKey]: 0,
      orderBy: orderByVal,
      consolidate: true,
      bucketIdEq: props.bucketId,
    });

  if (transactionsQuery.isLoading || transactionsQuery.isUninitialized)
    return <Loader active size="huge" />;

  if (transactionsQuery.isError)
    return <QueryErrorMessage query={transactionsQuery} />;

  const transactions = transactionsQuery.data;

  const totalAmount =
    props.categoryId === undefined
      ? props.plStatement[props.showIncome ? "income" : "expenses"]
      : props.plStatement[
          props.showIncome ? "income_by_category" : "expenses_by_category"
        ][props.categoryId];
  console.log(totalAmount);
  return (
    <Card.Group style={{ margin: 0 }}>
      {transactions
        .reduce(
          (
            acc: { amount: number; transaction: ConsolidatedTransaction }[],
            transaction,
          ) => {
            const amount =
              (acc.length && acc[acc.length - 1].amount) +
              transaction.amount_default_currency;
            return [...acc, { amount, transaction }];
          },
          [],
        )
        .map((acc) =>
          acc.transaction.is_group ? (
            <TransactionCard.Group
              key={acc.transaction.id}
              transaction={acc.transaction}
              explanationRate={acc.amount / totalAmount}
            />
          ) : (
            <TransactionCard.Simple
              key={acc.transaction.id}
              transaction={acc.transaction}
              explanationRate={acc.amount / totalAmount}
              currency="default"
            />
          ),
        )}
    </Card.Group>
  );
}
