import { api } from "app/services/api";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { MovementCard } from "features/movements/components/MovementCard";
import { TransactionCard } from "features/transaction/components/TransactionCard";
import { Card, Loader } from "semantic-ui-react";
import { formatDateParam } from "utils/time";

export function MovementsByAmount(props: {
  startDate: Date;
  endDate: Date;
  showIncome: boolean;
}) {
  const movementsQuery = api.endpoints.readManyApiMovementsGet.useQuery({
    startDate: formatDateParam(props.startDate),
    endDate: formatDateParam(props.endDate),
    isDescending: props.showIncome,
    sortBy: "amount",
    ...(props.showIncome ? { amountGt: 0 } : { amountLt: 0 }),
  });

  if (movementsQuery.isLoading || movementsQuery.isUninitialized)
    return <Loader active size="huge" />;
  if (movementsQuery.isError)
    return <QueryErrorMessage query={movementsQuery} />;

  const movements = movementsQuery.data;

  return (
    <Card.Group>
      {movements.map((movement) =>
        movement.transactions.length === 1 ? (
          <TransactionCard transaction={movement.transactions[0]} />
        ) : (
          <MovementCard key={movement.id} movement={movement} />
        )
      )}
    </Card.Group>
  );
}
