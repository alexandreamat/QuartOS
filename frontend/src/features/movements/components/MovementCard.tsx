import { MovementApiOut, TransactionApiOut } from "app/services/api";
import { Card, Grid, Header } from "semantic-ui-react";
import FormattedTimestamp from "components/FormattedTimestamp";
import EditActionButton from "components/EditActionButton";
import { Flows } from "./Flows";
import CreateNewButton from "components/CreateNewButton";
import CurrencyLabel from "components/CurrencyLabel";

export function MovementCard(props: {
  movement: MovementApiOut;
  onOpenEditForm?: () => void;
  onOpenCreateTransactionForm?: () => void;
  onRemoveTransaction?: (x: TransactionApiOut) => void;
}) {
  const firstTransaction = props.movement.transactions[0];

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
          <Grid.Column>
            <Header as="h4">{firstTransaction.name}</Header>
          </Grid.Column>
          {props.onOpenEditForm && (
            <Grid.Column width={1} textAlign="center">
              <EditActionButton onOpenEditForm={props.onOpenEditForm} />
            </Grid.Column>
          )}
        </Grid>
        <Flows
          transactions={props.movement.transactions}
          onRemove={props.onRemoveTransaction}
        />
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
