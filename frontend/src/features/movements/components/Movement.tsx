import { MovementApiOut, api } from "app/services/api";
import { Placeholder } from "semantic-ui-react";
import { MovementCard } from "./MovementCard";

export function Movement(props: {
  movement: MovementApiOut;
  onOpenEditForm: () => void;
}) {
  const transactionsQuery =
    api.endpoints.readTransactionsApiMovementsIdTransactionsGet.useQuery(
      props.movement.id
    );

  if (transactionsQuery.isLoading)
    return (
      <Placeholder>
        <Placeholder.Line />
      </Placeholder>
    );

  if (!transactionsQuery.isSuccess) return <></>;

  if (transactionsQuery.data.length === 0) return <></>;

  const firstTransaction = transactionsQuery.data[0];

  const outflows = transactionsQuery.data.filter((t) => t.amount < 0);
  const inflows = transactionsQuery.data.filter((t) => t.amount >= 0);

  return (
    <MovementCard
      inflows={inflows}
      outflows={outflows}
      name={firstTransaction.name}
      onOpenEditForm={props.onOpenEditForm}
      movement={props.movement}
    />
  );
}
