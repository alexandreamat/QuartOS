import { MovementApiOut, TransactionApiOut, api } from "app/services/api";
import { Card, Grid, Header, Placeholder } from "semantic-ui-react";
import FormattedTimestamp from "components/FormattedTimestamp";
import EditActionButton from "components/EditActionButton";
import { Flows } from "./Flows";
import CreateNewButton from "components/CreateNewButton";
import CurrencyLabel from "components/CurrencyLabel";
import { QueryErrorMessage } from "components/QueryErrorMessage";

export function Movement(props: {
  movement: MovementApiOut;
  onOpenEditForm?: () => void;
  onOpenCreateTransactionForm?: () => void;
  onRemoveTransaction?: (x: TransactionApiOut) => void;
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

  // const firstTransaction = transactionsQuery.data[0];

  return (
    <Card fluid color="teal">
      <Card.Content>
        <Grid columns="equal">
          <Grid.Column width={3}>
            <Card.Meta>
              <FormattedTimestamp
                timestamp={props.movement.earliest_timestamp}
              />
            </Card.Meta>
          </Grid.Column>
          {/* <Grid.Column>
            <Header as="h4">{firstTransaction.name}</Header>
          </Grid.Column> */}
          {props.onOpenEditForm && (
            <Grid.Column width={1} textAlign="center">
              <EditActionButton onOpenEditForm={props.onOpenEditForm} />
            </Grid.Column>
          )}
        </Grid>
        {transactionsQuery.isSuccess && (
          <Flows
            transactions={transactionsQuery.data}
            onRemove={props.onRemoveTransaction}
          />
        )}
        {transactionsQuery.isError && (
          <QueryErrorMessage query={transactionsQuery} />
        )}
      </Card.Content>
      <Card.Content extra>
        {props.onOpenCreateTransactionForm && (
          <CreateNewButton
            floated="left"
            compact
            onCreate={props.onOpenCreateTransactionForm}
            content="Add Transaction"
          />
        )}
        <Header as="h5" floated="right">
          Total:
          {Object.entries(props.movement.amounts).map(
            ([currencyCode, amount], i) => (
              <CurrencyLabel
                key={i}
                amount={amount}
                currencyCode={currencyCode}
              />
            )
          )}
        </Header>
      </Card.Content>
    </Card>
  );
}
