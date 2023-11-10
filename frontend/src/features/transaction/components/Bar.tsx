// Copyright (C) 2023 Alexandre Amat
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

import MenuDateRange from "components/MenuDateInput";
import MenuDropdownAccount from "components/MenuDropdownAccount";
import MenuInputSearch from "components/MenuInputSearch";
import MenuNumericRange from "components/MenuNumericRange";
import { Menu } from "semantic-ui-react";
import MenuCheckbox from "components/MenuCheckbox";
import { useState } from "react";
import { UseStateType } from "types";

export type TransactionsBarState = ReturnType<typeof useTransactionBarState>;

export function useTransactionBarState() {
  return {
    accountId: useState<number | undefined>(),
    search: useState<string>(),
    timestampGe: useState<Date>(),
    timestampLe: useState<Date>(),
    isDescending: useState(true),
    amountGe: useState<number>(),
    amountLe: useState<number>(),
    isAmountAbs: useState(false),
  };
}

export default function Bar(props: {
  barState: TransactionsBarState;
  isMultipleChoiceState?: UseStateType<boolean>;
}) {
  return (
    <Menu secondary>
      <MenuInputSearch searchState={props.barState.search} />
      <MenuDropdownAccount accountIdState={props.barState.accountId} />
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
      {props.isMultipleChoiceState && (
        <MenuCheckbox isMultipleChoiceState={props.isMultipleChoiceState} />
      )}
    </Menu>
  );
}
