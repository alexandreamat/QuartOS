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

import FlexRow from "components/FlexRow";
import MenuCheckbox from "components/MenuCheckbox";
import MenuDateRange from "components/MenuDateInput";
import MenuDropdownAccount from "features/account/components/MenuDropdownAccount";
import MenuInputSearch from "components/MenuInputSearch";
import MenuNumericRange from "components/MenuNumericRange";
import { useState } from "react";
import { Button, Menu } from "semantic-ui-react";
import { UseStateType } from "types";
import TransactionForm from "./Form";

export type TransactionsBarState = ReturnType<typeof useTransactionBarState>;

export function useTransactionBarState() {
  return {
    search: useState<string>(""),
    timestampGe: useState<Date>(),
    timestampLe: useState<Date>(),
    isDescending: useState(true),
    amountGe: useState<number>(),
    amountLe: useState<number>(),
    isAmountAbs: useState(false),
    consolidate: useState(false),
  };
}

export default function Bar(props: {
  barState: TransactionsBarState;
  isMultipleChoiceState?: UseStateType<boolean>;
  accountIdState?: UseStateType<number | undefined>;
  consolidateState?: UseStateType<number | undefined>;
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <FlexRow>
      <FlexRow.Auto>
        {/* Correct negative margins that would add unnecessary scroll bar */}
        <Menu secondary style={{ margin: 0 }}>
          <Menu.Item fitted>
            <Button
              icon="plus"
              circular
              primary
              onClick={() => setIsFormOpen(true)}
            />
            {isFormOpen && (
              <TransactionForm.Create onClose={() => setIsFormOpen(false)} />
            )}
          </Menu.Item>
          <MenuCheckbox
            state={props.barState.consolidate}
            icon={
              props.barState.consolidate[0] ? "object ungroup" : "object group"
            }
            tooltip={props.barState.consolidate[0] ? "Ungroup" : "Group"}
          />
          <MenuInputSearch searchState={props.barState.search} />
          <MenuDateRange
            dateGeState={props.barState.timestampGe}
            dateLeState={props.barState.timestampLe}
            isDescendingState={props.barState.isDescending}
          />
          <MenuNumericRange
            icon="dollar"
            valueGeState={props.barState.amountGe}
            valueLeState={props.barState.amountLe}
            isAbsState={props.barState.isAmountAbs}
            signed
            decimal
          />
          {props.accountIdState && (
            <MenuDropdownAccount accountIdState={props.accountIdState} />
          )}
          {props.isMultipleChoiceState && (
            <MenuCheckbox state={props.isMultipleChoiceState} />
          )}
        </Menu>
      </FlexRow.Auto>
    </FlexRow>
  );
}
