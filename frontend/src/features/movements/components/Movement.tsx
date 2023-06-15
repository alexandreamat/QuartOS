import { MovementApiOut, api } from "app/services/api";
import ConfirmDeleteButton from "components/ConfirmDeleteButton";
import FormattedTimestamp from "components/FormattedTimestamp";
import { Card, Grid, Placeholder } from "semantic-ui-react";
import { logMutationError } from "utils/error";
import { Flows } from "./Flows";

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
    <Card fluid color="teal">
      <Card.Content>
        <Card.Header>
          <Grid columns="equal">
            <Grid.Column>{firstTransaction.name}</Grid.Column>
            <Grid.Column textAlign="right">
              <ConfirmDeleteButton
                query={deleteMovementResult}
                onDelete={handleDelete}
              />
            </Grid.Column>
          </Grid>
        </Card.Header>
        <Card.Meta>
          <FormattedTimestamp timestamp={firstTransaction.timestamp} />
        </Card.Meta>
      </Card.Content>
      <Card.Content extra>
        <Flows inflows={inflows} outflows={outflows} />
      </Card.Content>
    </Card>
  );
}
