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
import { MovementCard } from "features/movements/components/MovementCard";
import { Card, Loader } from "semantic-ui-react";

export default function PLMovements(props: {
  aggregate: PlStatement;
  showIncome: boolean;
  onOpenEditForm: (x: MovementApiOut) => void;
  categoryId?: number;
}) {
  const movementsQuery = api.endpoints.readManyUsersMeMovementsGet.useQuery({
    startDate: props.aggregate.start_date,
    endDate: props.aggregate.end_date,
    categoryId: props.categoryId,
    amountGt: props.showIncome ? 0 : undefined,
    amountLt: props.showIncome ? undefined : 0,
  });

  if (movementsQuery.isLoading || movementsQuery.isUninitialized)
    return <Loader active size="huge" />;

  if (movementsQuery.isError)
    return <QueryErrorMessage query={movementsQuery} />;

  const movements = movementsQuery.data;

  const totalAmount = props.showIncome
    ? Number(props.aggregate.income)
    : Number(props.aggregate.expenses);

  let cumulativeAmount = 0;

  return (
    <Card.Group style={{ margin: 0 }}>
      {movements.map((movement) => {
        cumulativeAmount += Number(movement.amount_default_currency);
        const explanationRate = (cumulativeAmount / totalAmount) * 100;
        return (
          <MovementCard
            key={movement.id}
            movement={movement}
            onOpenEditForm={() => props.onOpenEditForm(movement)}
            explanationRate={explanationRate}
            showFlows={movement.transactions.length > 1}
            hideCategory={props.categoryId !== undefined}
          />
        );
      })}
    </Card.Group>
  );
}
