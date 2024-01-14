// Copyright (C) 2024 Alexandre Amat
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import {
  MovementApiIn,
  MovementApiOut,
  TransactionApiOut,
  api,
} from "app/services/api";
import ClickableIcon from "components/ClickableIcon";
import CurrencyLabel from "components/CurrencyLabel";
import FlexRow from "components/FlexRow";
import FormattedTimestamp from "components/FormattedTimestamp";
import LineWithHiddenOverflow from "components/LineWithHiddenOverflow";
import MutateActionButton from "components/MutateActionButton";
import { useEffect, useState } from "react";
import { Button, Card, Checkbox, Header, Input } from "semantic-ui-react";
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
    api.endpoints.updateUsersMeMovementsMovementIdPut.useMutation();

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
        <FlexRow alignItems="center" gap="1ch">
          {!props.loading && props.onCheckedChange && (
            <Checkbox
              checked={props.checked}
              onChange={(_, data) =>
                props.onCheckedChange!(data.checked || false)
              }
            />
          )}
          <Card.Meta>
            <FormattedTimestamp
              timestamp={props.movement?.earliest_timestamp || undefined}
              loading={props.loading}
              style={{ width: "9em" }}
            />
          </Card.Meta>

          {/* Name */}
          <FlexRow.Auto>
            {isEditMode ? (
              <Input
                style={{ width: "100%" }}
                value={name}
                onChange={(_, d) => setName(d.value)}
              />
            ) : (
              <Header as="h5">
                <LineWithHiddenOverflow
                  content={props.movement?.name}
                  loading={props.loading}
                />
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

          {props.onOpenEditForm && (
            <MutateActionButton
              onOpenEditForm={props.onOpenEditForm}
              disabled={props.loading}
            />
          )}
        </FlexRow>

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
        <FlexRow gap="1ch" alignItems="baseline">
          {"explanationRate" in props && props.explanationRate && (
            <Header sub floated="left" style={{ marginRight: "auto" }}>
              {props.explanationRate.toFixed(0)}% of cumulative total
            </Header>
          )}
          <div
            style={{ color: "black", fontWeight: "bold", marginLeft: "auto" }}
          >
            Total:
          </div>
          {props.movement ? (
            Object.entries(props.movement.amounts).map(
              ([currencyCode, amount], i) => (
                <CurrencyLabel
                  key={i}
                  amount={Number(amount)}
                  currencyCode={currencyCode}
                />
              ),
            )
          ) : (
            <CurrencyLabel loading />
          )}
        </FlexRow>
      </Card.Content>
    </Card>
  );
}
