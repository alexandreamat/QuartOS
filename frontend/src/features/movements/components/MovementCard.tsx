import {
  MovementApiIn,
  MovementApiOut,
  TransactionApiOut,
  api,
} from "app/services/api";
import {
  Button,
  Card,
  Grid,
  Header,
  Input,
  Placeholder,
} from "semantic-ui-react";
import FormattedTimestamp from "components/FormattedTimestamp";
import { Flows } from "./Flows";
import CreateNewButton from "components/CreateNewButton";
import CurrencyLabel from "components/CurrencyLabel";
import MutateActionButton from "components/MutateActionButton";
import LineWithHiddenOverflow from "components/LineWithHiddenOverflow";
import { useState } from "react";
import { ClickableIcon } from "components/ClickableIcon";
import FlexRow from "components/FlexRow";
import { logMutationError } from "utils/error";

export function MovementCard(props: {
  movement: MovementApiOut;
  onOpenEditForm?: () => void;
  onOpenCreateTransactionForm?: () => void;
  onOpenEditTransactionForm?: (x: TransactionApiOut) => void;
  onRemoveTransaction?: (x: TransactionApiOut) => void;
  explanationRate?: number;
  selectedAccountId?: number;
  onMutate?: () => void;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [name, setName] = useState(props.movement.name);

  const [updateMovement, updateMovementResult] =
    api.endpoints.updateApiUsersMeMovementsMovementIdPut.useMutation();

  async function updateName() {
    const newMovement: MovementApiIn = { ...props.movement, name };
    try {
      await updateMovement({
        movementId: props.movement.id,
        movementApiIn: newMovement,
      });
    } catch (error) {
      logMutationError(error, updateMovementResult);
      return;
    }
    setIsEditMode(false);
    props.onMutate && props.onMutate();
  }

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
            {isEditMode ? (
              <FlexRow style={{ alignItems: "center", gap: 5 }}>
                <FlexRow.Auto>
                  <Input
                    style={{ width: "100%" }}
                    value={name}
                    onChange={(e, d) => setName(d.value)}
                  />
                </FlexRow.Auto>
                <Button
                  icon="cancel"
                  circular
                  size="tiny"
                  onClick={() => {
                    setName(props.movement.name);
                    setIsEditMode(false);
                  }}
                />
                <Button
                  icon="check"
                  positive
                  circular
                  size="tiny"
                  onClick={updateName}
                  disabled={name === props.movement.name}
                  error={updateMovementResult.isError}
                  loading={updateMovementResult.isLoading}
                />
              </FlexRow>
            ) : (
              <FlexRow style={{ gap: 5 }}>
                <Header as="h5">
                  <LineWithHiddenOverflow content={props.movement.name} />
                </Header>
                {props.onMutate && (
                  <ClickableIcon
                    name="pencil"
                    onClick={() => setIsEditMode(true)}
                  />
                )}
              </FlexRow>
            )}
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
          selectedAccountId={props.selectedAccountId}
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
