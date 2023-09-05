import MenuDateRange from "components/MenuDateInput";
import MenuDropdownAccount from "components/MenuDropdownAccount";
import MenuInputSearch from "components/MenuInputSearch";
import MenuNumericRange from "components/MenuNumericRange";
import { Button, Menu } from "semantic-ui-react";
import { UseStateType } from "types";

export default function Bar(props: {
  accountIdState: UseStateType<number | undefined>;
  searchState: UseStateType<string | undefined>;
  dateGeState: UseStateType<Date | undefined>;
  dateLeState: UseStateType<Date | undefined>;
  isDescendingState: UseStateType<boolean>;
  amountGeState: UseStateType<number | undefined>;
  amountLeState: UseStateType<number | undefined>;
  isAmountAbsState: UseStateType<boolean>;
  isMultipleChoiceState: UseStateType<boolean>;
}) {
  const [isMultipleChoice, setIsMultipleChoice] = props.isMultipleChoiceState;
  return (
    <Menu secondary>
      <MenuInputSearch searchState={props.searchState} />
      <MenuDropdownAccount accountIdState={props.accountIdState} />
      <MenuDateRange
        dateGeState={props.dateGeState}
        dateLeState={props.dateLeState}
        isDescendingState={props.isDescendingState}
      />
      <MenuNumericRange
        icon="dollar"
        valueGeState={props.amountGeState}
        valueLeState={props.amountLeState}
        isAbsState={props.isAmountAbsState}
        signed
        decimal
      />
      <Menu.Item fitted>
        <Button
          icon="check square"
          toggle
          active={isMultipleChoice}
          onClick={() => setIsMultipleChoice((x) => !x)}
        />
      </Menu.Item>
    </Menu>
  );
}
