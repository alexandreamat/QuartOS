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

import { Button, Menu } from "semantic-ui-react";
import MenuDateRange from "components/MenuDateInput";
import MenuInputSearch from "components/MenuInputSearch";
import MenuDropdownAccount from "components/MenuDropdownAccount";
import MenuNumericRange from "components/MenuNumericRange";
import MenuCheckbox from "components/MenuCheckbox";
import { useState } from "react";

export type MovementsBarState = ReturnType<typeof useMovementsBarState>;

export function useMovementsBarState() {
  return {
    searchState: useState<string | undefined>(undefined),
    startDateState: useState<Date | undefined>(undefined),
    endDateState: useState<Date | undefined>(undefined),
    accountIdState: useState<number | undefined>(undefined),
    transactionsGeState: useState<number | undefined>(undefined),
    transactionsLeState: useState<number | undefined>(undefined),
    isDescendingState: useState(true),
    amountGeState: useState<number>(),
    amountLeState: useState<number>(),
    isAmountAbsState: useState(false),
    isMultipleChoiceState: useState(false),
  };
}

export function Bar(props: {
  onOpenCreateForm: () => void;
  barState: MovementsBarState;
}) {
  return (
    <Menu secondary>
      <Menu.Item fitted>
        <Button icon="plus" circular primary onClick={props.onOpenCreateForm} />
      </Menu.Item>
      <MenuInputSearch searchState={props.barState.searchState} />
      <MenuDropdownAccount accountIdState={props.barState.accountIdState} />
      <MenuDateRange
        dateGeState={props.barState.startDateState}
        dateLeState={props.barState.endDateState}
        isDescendingState={props.barState.isDescendingState}
      />
      <MenuNumericRange
        icon="exchange"
        valueGeState={props.barState.transactionsGeState}
        valueLeState={props.barState.transactionsLeState}
      />
      <MenuNumericRange
        icon="dollar"
        valueGeState={props.barState.amountGeState}
        valueLeState={props.barState.amountLeState}
        isAbsState={props.barState.isAmountAbsState}
        decimal
        signed
      />
      <MenuCheckbox
        isMultipleChoiceState={props.barState.isMultipleChoiceState}
      />
    </Menu>
  );
}
