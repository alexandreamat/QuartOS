import { MovementApiOut, TransactionApiOut } from "app/services/api";
import { Button, Card, Grid, Header, Placeholder } from "semantic-ui-react";
import FormattedTimestamp from "components/FormattedTimestamp";
import { Flows } from "./Flows";
import CreateNewButton from "components/CreateNewButton";
import CurrencyLabel from "components/CurrencyLabel";
import MutateActionButton from "components/MutateActionButton";
import LimitedText from "components/LimitedString";

export function MovementCard(props: {
  movement: MovementApiOut;
  onOpenEditForm?: () => void;
  onOpenCreateTransactionForm?: () => void;
  onOpenEditTransactionForm?: (x: TransactionApiOut) => void;
  onRemoveTransaction?: (x: TransactionApiOut) => void;
  explanationRate?: number;
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
            <Header as="h5">
              <LimitedText str={props.movement.name} maxLength={50} />
            </Header>
          </Grid.Column>
          {props.onOpenEditForm && (
            <Grid.Column width={1} textAlign="center">
              <MutateActionButton onOpenEditForm={props.onOpenEditForm} />
            </Grid.Column>
          )}
        </Grid>
        <Flows
          transactions={props.movement.transactions}
          onRemove={props.onRemoveTransaction}
          onOpenEditForm={props.onOpenEditTransactionForm}
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
        {"explanationRate" in props && props.explanationRate && (
          <Header sub floated="left">
            {props.explanationRate.toFixed(0)}%
          </Header>
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

function MovementCardPlaceholder(props: {
  onOpenEditForm?: boolean;
  onOpenCreateTransactionForm?: boolean;
  onOpenEditTransactionForm?: boolean;
  onRemoveTransaction?: boolean;
  explanationRate?: boolean;
}) {
  return (
    <Card fluid color="teal">
      <Card.Content>
        <Grid columns="equal">
          <Grid.Column width={3}>
            <Placeholder fluid>
              <Placeholder.Header>
                <Placeholder.Line />
              </Placeholder.Header>
            </Placeholder>
          </Grid.Column>
          <Grid.Column>
            <Placeholder fluid>
              <Placeholder.Header>
                <Placeholder.Line />
              </Placeholder.Header>
            </Placeholder>
          </Grid.Column>
          {props.onOpenEditForm && (
            <Grid.Column width={1} textAlign="center">
              <Button
                circular
                basic
                icon="ellipsis horizontal"
                size="tiny"
                loading
              />
            </Grid.Column>
          )}
        </Grid>
        <Flows.Placeholder
          onRemove={props.onRemoveTransaction}
          onOpenEditForm={props.onOpenEditTransactionForm}
        />
      </Card.Content>
      <Card.Content extra>
        {props.onOpenCreateTransactionForm && (
          <CreateNewButton.Placeholder
            floated="left"
            compact
            content="Add Transaction"
          />
        )}
        {props.explanationRate && (
          <Placeholder>
            <Placeholder.Header>
              <Placeholder.Line />
            </Placeholder.Header>
          </Placeholder>
        )}
        <Header as="h5" floated="right">
          <div>
            Total:
            <CurrencyLabel.Placeholder />
          </div>
        </Header>
      </Card.Content>
    </Card>
  );
}

MovementCard.Placeholder = MovementCardPlaceholder;
