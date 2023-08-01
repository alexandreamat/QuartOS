import { MovementApiOut, api } from "app/services/api";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import MovementUnifiedCard from "features/movements/components/MovementUnifiedCard";
import { Card, Loader } from "semantic-ui-react";
import { formatDateParam } from "utils/time";

export function MovementsByAmount(props: {
  startDate: Date;
  endDate: Date;
  showIncome: boolean;
  onOpenEditForm: (x: MovementApiOut) => void;
}) {
  const movementsQuery = api.endpoints.readManyApiUsersMeMovementsGet.useQuery({
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

  const totalAmount = movements.reduce(
    (c, m, i) => c + m.amount_default_currency,
    0
  );
  let cumulativeAmount = 0;

  return (
    <Card.Group>
      {movements.map((movement) => {
        cumulativeAmount += movement.amount_default_currency;
        const explanationRate = (cumulativeAmount / totalAmount) * 100;
        return (
          <MovementUnifiedCard
            key={movement.id}
            movement={movement}
            onOpenEditForm={() => props.onOpenEditForm(movement)}
            explanationRate={explanationRate}
          />
        );
      })}
    </Card.Group>
  );
}
