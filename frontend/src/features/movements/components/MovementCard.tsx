import { TransactionApiOut } from "app/services/api";
import ConfirmDeleteButton from "components/ConfirmDeleteButton";
import FormattedTimestamp from "components/FormattedTimestamp";
import { Card, Grid, Header } from "semantic-ui-react";
import { Flows } from "./Flows";
import CurrencyLabel from "components/CurrencyLabel";
import { SimpleQuery } from "interfaces";

export function MovementCard(props: {
  deleteQuery: SimpleQuery;
  onDelete: () => Promise<void>;
  name: string;
  timestamp?: string;
  outflows: TransactionApiOut[];
  inflows: TransactionApiOut[];
  amount?: number;
  currencyCode?: string;
}) {
  return (
    <Card fluid color="teal">
      <Card.Content>
        <Grid>
          <Grid.Column width={3}>
            <Card.Meta>
              <FormattedTimestamp timestamp={props.timestamp} />
            </Card.Meta>
          </Grid.Column>
          <Grid.Column width={10}>
            <Header as="h4">{props.name}</Header>
          </Grid.Column>
          <Grid.Column width={2} textAlign="right"></Grid.Column>
          <Grid.Column width={1} textAlign="right">
            <ConfirmDeleteButton
              query={props.deleteQuery}
              onDelete={props.onDelete}
            />
          </Grid.Column>
        </Grid>
        <Flows inflows={props.inflows} outflows={props.outflows} />
      </Card.Content>
      {props.amount !== undefined && props.currencyCode && (
        <Card.Content extra>
          <Header as="h5" floated="right">
            Total:
            <CurrencyLabel
              amount={props.amount}
              currencyCode={props.currencyCode}
            />
          </Header>
        </Card.Content>
      )}
    </Card>
  );
}
