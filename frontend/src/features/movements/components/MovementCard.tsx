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
import { CategoryIcon } from "features/categories/components/CategoryIcon";
import CategoriesDropdown from "features/categories/components/CategoriesDropdown";
import useFormField from "hooks/useFormField";
import { skipToken } from "@reduxjs/toolkit/dist/query";

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
  hideCategory?: boolean;
}) {
  const [name, setName] = useState(props.movement?.name || "");
  const [isEditMode, setIsEditMode] = useState(false);
  const categoryId = useFormField(props.movement?.category_id || undefined);

  const [updateMovement, updateMovementResult] =
    api.endpoints.updateUsersMeMovementsMovementIdPut.useMutation();

  const me = api.endpoints.readMeUsersMeGet.useQuery();
  const transactionsQuery =
    api.endpoints.readManyUsersMeMovementsMovementIdTransactionsGet.useQuery(
      props.movement ? props.movement.id : skipToken,
    );

  async function submitUpdateMovement() {
    if (!props.movement) return;

    const newMovement: MovementApiIn = {
      ...props.movement,
      name,
      category_id: categoryId.value!,
    };
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
    if (!props.movement) return;
    setName(props.movement.name);
    categoryId.set(props.movement.category_id || undefined);
  }, [props.movement]);

  return (
    <Card fluid color="teal" style={{ marginLeft: 0, marginRight: 0 }}>
      <Card.Content>
        <FlexRow alignItems="center" gap="1ch" style={{ height: "2.2em" }}>
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
              timestamp={props.movement?.timestamp || undefined}
              loading={props.loading}
              style={{ width: "9em" }}
            />
          </Card.Meta>

          {isEditMode ? (
            <CategoriesDropdown categoryId={categoryId} />
          ) : (
            props.movement?.category_id &&
            !props.hideCategory && (
              <CategoryIcon categoryId={props.movement?.category_id} />
            )
          )}

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

          {/* Edit controls */}
          {props.movement &&
            (isEditMode ? (
              <>
                <Button
                  icon="cancel"
                  circular
                  size="tiny"
                  onClick={() => {
                    setName(props.movement!.name);
                    categoryId.set(props.movement?.category_id || undefined);
                    setIsEditMode(false);
                  }}
                />
                <Button
                  icon="check"
                  positive
                  circular
                  size="tiny"
                  onClick={submitUpdateMovement}
                  disabled={
                    name === props.movement.name && !categoryId.hasChanged
                  }
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
              content={props.movement?.transactions_count.toFixed(0)}
            />
          )}
        </FlexRow>

        {props.showFlows && (
          <Flows
            onRemove={props.onRemoveTransaction}
            selectedAccountId={props.selectedAccountId}
            loading={props.loading}
            transactions={transactionsQuery.data}
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
          <CurrencyLabel
            amount={Number(props.movement?.amount_default_currency)}
            currencyCode={me.data?.default_currency_code}
            loading={me.isLoading || props.loading}
          />
        </FlexRow>
      </Card.Content>
    </Card>
  );
}
