import { MovementApiOut, TransactionApiOut } from "app/services/api";
import ConfirmDeleteButton from "components/ConfirmDeleteButton";
import FormattedTimestamp from "components/FormattedTimestamp";
import { Card, Grid, Header } from "semantic-ui-react";
import { Flows } from "./Flows";
import CurrencyLabel from "components/CurrencyLabel";
import { SimpleQuery } from "interfaces";
import EditActionButton from "components/EditActionButton";

export function MovementCard(props: {
  deleteQuery: SimpleQuery;
  onDelete: () => Promise<void>;
  onOpenEditForm: () => void;
  name: string;
  outflows: TransactionApiOut[];
  inflows: TransactionApiOut[];
  movement: MovementApiOut;
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
          <Grid.Column width={1} textAlign="center">
            <EditActionButton onOpenEditForm={props.onOpenEditForm} />
          </Grid.Column>
          <Grid.Column width={1} textAlign="center">
            <ConfirmDeleteButton
              query={props.deleteQuery}
              onDelete={props.onDelete}
            />
          </Grid.Column>
        </Grid>
        <Flows inflows={props.inflows} outflows={props.outflows} />
      </Card.Content>
      <Card.Content extra>
        <Header as="h5" floated="right">
          Total:
          {Object.entries(props.movement.amounts).map(
            ([currencyCode, amount]) => (
              <CurrencyLabel amount={amount} currencyCode={currencyCode} />
            )
          )}
        </Header>
      </Card.Content>
    </Card>
  );
}
