import {
  MovementApiIn,
  MovementApiOut,
  TransactionApiOut,
  api,
} from "app/services/api";
import ClickableIcon from "components/ClickableIcon";
import CreateNewButton from "components/CreateNewButton";
import CurrencyLabel from "components/CurrencyLabel";
import FlexRow from "components/FlexRow";
import FormattedTimestamp from "components/FormattedTimestamp";
import LineWithHiddenOverflow from "components/LineWithHiddenOverflow";
import MutateActionButton from "components/MutateActionButton";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Header,
  Input,
  Placeholder,
} from "semantic-ui-react";
import { logMutationError } from "utils/error";
import { Flows } from "./Flows";

export function MovementCard(props: {
  movement?: MovementApiOut;
  loading?: boolean;
  onOpenEditForm?: () => void;
  onRemoveTransaction?: (x: TransactionApiOut) => void;
  explanationRate?: number;
  selectedAccountId?: number;
  showFlows?: boolean;
  editable?: boolean;
  onCheckedChange?: (x: boolean) => void;
  checked?: boolean;
}) {
  const [name, setName] = useState(props.movement?.name || "");
  const [isEditMode, setIsEditMode] = useState(false);

  const [updateMovement, updateMovementResult] =
    api.endpoints.updateApiUsersMeMovementsMovementIdPut.useMutation();

  async function updateName() {
    if (!props.movement) return;

    const newMovement: MovementApiIn = { ...props.movement, name };
    try {
      await updateMovement({
        movementId: props.movement.id,
        movementApiIn: newMovement,
      }).unwrap();
    } catch (error) {
      logMutationError(error, updateMovementResult);
      return;
    }
    setIsEditMode(false);
  }

  useEffect(() => {
    if (props.movement) setName(props.movement.name);
  }, [props.movement]);

  return (
    <Card fluid color="teal" style={{ marginLeft: 0, marginRight: 0 }}>
      <Card.Content>
        <FlexRow style={{ alignItems: "center", gap: "1em" }}>
          {/* Checkbox */}
          {!props.loading && props.onCheckedChange && (
            <Checkbox
              checked={props.checked}
              onChange={(_, data) =>
                props.onCheckedChange!(data.checked || false)
              }
            />
          )}

          {/* Timestamp */}
          {props.loading ? (
            <Placeholder fluid>
              <Placeholder.Header>
                <Placeholder.Line style={{ width: "10em" }} />
              </Placeholder.Header>
            </Placeholder>
          ) : (
            <Card.Meta>
              <FormattedTimestamp
                timestamp={props.movement?.earliest_timestamp}
              />
            </Card.Meta>
          )}

          {/* Name */}
          <FlexRow.Auto>
            {props.loading ? (
              <Placeholder fluid>
                <Placeholder.Header>
                  <Placeholder.Line style={{ width: "100%" }} />
                </Placeholder.Header>
              </Placeholder>
            ) : isEditMode ? (
              <Input
                style={{ width: "100%" }}
                value={name}
                onChange={(_, d) => setName(d.value)}
              />
            ) : (
              <Header as="h5">
                <LineWithHiddenOverflow content={props.movement?.name} />
              </Header>
            )}
          </FlexRow.Auto>

          {/* Edit name controls */}
          {props.movement &&
            (isEditMode ? (
              <>
                <Button
                  icon="cancel"
                  circular
                  size="tiny"
                  onClick={() => {
                    setName(props.movement!.name);
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
                  negative={updateMovementResult.isError}
                  loading={updateMovementResult.isLoading}
                />
              </>
            ) : (
              props.editable && (
                <ClickableIcon
                  name="pencil"
                  onClick={() => setIsEditMode(true)}
                />
              )
            ))}

          {/* "See more" button */}
          {props.onOpenEditForm && (
            <MutateActionButton
              onOpenEditForm={props.onOpenEditForm}
              loading={props.loading}
            />
          )}
        </FlexRow>

        {/* Flows */}
        {props.showFlows && (
          <Flows
            onRemove={props.onRemoveTransaction}
            selectedAccountId={props.selectedAccountId}
            loading={props.loading}
            transactions={props.movement?.transactions}
          />
        )}
      </Card.Content>
      <Card.Content extra>
        {"explanationRate" in props && props.explanationRate && (
          <Header sub floated="left">
            {props.explanationRate.toFixed(0)}%
          </Header>
        )}
        <Header as="h5" floated="right">
          Total:
          {props.movement ? (
            Object.entries(props.movement.amounts).map(
              ([currencyCode, amount], i) => (
                <CurrencyLabel
                  key={i}
                  amount={amount}
                  currencyCode={currencyCode}
                />
              )
            )
          ) : (
            <CurrencyLabel loading />
          )}
        </Header>
      </Card.Content>
    </Card>
  );
}
