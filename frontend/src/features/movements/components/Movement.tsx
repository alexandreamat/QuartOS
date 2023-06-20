import { MovementApiOut, api } from "app/services/api";
import { Placeholder } from "semantic-ui-react";
import { logMutationError } from "utils/error";
import { MovementCard } from "./MovementCard";

export function Movement(props: { movement: MovementApiOut }) {
  const transactionsQuery =
    api.endpoints.readTransactionsApiMovementsIdTransactionsGet.useQuery(
      props.movement.id
    );

  const [deleteMovement, deleteMovementResult] =
    api.endpoints.deleteApiMovementsIdDelete.useMutation();

  const handleDelete = async () => {
    try {
      await deleteMovement(props.movement.id).unwrap();
    } catch (error) {
      logMutationError(error, deleteMovementResult);
      return;
    }
  };

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
      deleteQuery={deleteMovementResult}
      inflows={inflows}
      outflows={outflows}
      name={firstTransaction.name}
      onDelete={handleDelete}
      movement={props.movement}
    />
  );
}
