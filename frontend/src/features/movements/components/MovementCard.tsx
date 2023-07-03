import { MovementApiOut, TransactionApiOut } from "app/services/api";
import FormattedTimestamp from "components/FormattedTimestamp";
import { Card, Grid, Header } from "semantic-ui-react";
import { Flows } from "./Flows";
import CurrencyLabel from "components/CurrencyLabel";
import EditActionButton from "components/EditActionButton";
import CreateNewButton from "components/CreateNewButton";

export function MovementCard(props: {
  name: string;
  outflows: TransactionApiOut[];
  inflows: TransactionApiOut[];
  movement: MovementApiOut;
  onOpenEditForm?: () => void;
  onAddTransaction?: () => void;
  onRemoveTransaction?: (x: TransactionApiOut) => void;
}) {
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
            <Header as="h4">{props.name}</Header>
          </Grid.Column>
          {props.onOpenEditForm && (
            <Grid.Column width={1} textAlign="center">
              <EditActionButton onOpenEditForm={props.onOpenEditForm} />
            </Grid.Column>
          )}
        </Grid>
        {props.inflows.length + props.outflows.length > 1 && (
          <Flows
            inflows={props.inflows}
            outflows={props.outflows}
            onRemove={props.onRemoveTransaction}
          />
        )}
      </Card.Content>
      <Card.Content extra>
        {props.onAddTransaction && (
          <CreateNewButton
            floated="left"
            compact
            onCreate={props.onAddTransaction}
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
