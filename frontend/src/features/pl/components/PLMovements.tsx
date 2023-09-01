import { MovementApiOut, PlStatement, api } from "app/services/api";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { MovementCard } from "features/movements/components/MovementCard";
import { Card, Loader } from "semantic-ui-react";

export default function PLMovements(props: {
  aggregate: PlStatement;
  showIncome: boolean;
  onOpenEditForm: (x: MovementApiOut) => void;
}) {
  const movementsEndpoint = props.showIncome
    ? api.endpoints
        .readIncomeApiUsersMeMovementsAggregatesStartDateEndDateIncomeGet
    : api.endpoints
        .readExpensesApiUsersMeMovementsAggregatesStartDateEndDateExpensesGet;

  const movementsQuery = movementsEndpoint.useQuery({
    startDate: props.aggregate.start_date,
    endDate: props.aggregate.end_date,
  });

  if (movementsQuery.isLoading || movementsQuery.isUninitialized)
    return <Loader active size="huge" />;

  if (movementsQuery.isError)
    return <QueryErrorMessage query={movementsQuery} />;

  const movements = movementsQuery.data;

  const totalAmount = props.showIncome
    ? props.aggregate.income
    : props.aggregate.expenses;

  let cumulativeAmount = 0;

  return (
    <Card.Group style={{ margin: 0 }}>
      {movements.map((movement) => {
        cumulativeAmount += movement.amount;
        const explanationRate = (cumulativeAmount / totalAmount) * 100;
        return (
          <MovementCard
            key={movement.id}
            movement={movement}
            onOpenEditForm={() => props.onOpenEditForm(movement)}
            explanationRate={explanationRate}
            showFlows={movement.transactions.length > 1}
          />
        );
      })}
    </Card.Group>
  );
}
