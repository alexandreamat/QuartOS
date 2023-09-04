import { Button, Checkbox, Menu, Popup } from "semantic-ui-react";
import MenuDateInput from "components/MenuDateInput";
import { ClickableIcon } from "components/ClickableIcon";
import DecimalInput from "components/DecimalInput";
import MenuInputSearch from "components/MenuInputSearch";
import MenuDropdownAccount from "components/MenuDropdownAccount";
import MenuOrderButton from "components/MenuOrderButton";
import { UseStateType } from "types";

export default function Bar(props: {
  accountIdState: UseStateType<number | undefined>;
  searchState: UseStateType<string | undefined>;
  timestampState: UseStateType<Date | undefined>;
  isDescendingState: UseStateType<boolean>;
  amountGeState: UseStateType<number | undefined>;
  amountLeState: UseStateType<number | undefined>;
  isAmountAbsState: UseStateType<boolean>;
  isMultipleChoiceState: UseStateType<boolean>;
}) {
  const [amountGe, setAmountGe] = props.amountGeState;
  const [amountLe, setAmountLe] = props.amountLeState;
  const [isMultipleChoice, setIsMultipleChoice] = props.isMultipleChoiceState;
  const [isAmountAbs, setIsAmountAbs] = props.isAmountAbsState;
  return (
    <Menu secondary>
      <MenuInputSearch searchState={props.searchState} />
      <MenuDropdownAccount accountIdState={props.accountIdState} />
      <MenuDateInput label="from" dateState={props.timestampState} />
      <Menu.Item fitted>
        <Popup
          trigger={<Button icon="dollar" />}
          hoverable
          position="bottom right"
          on="click"
        >
          <Menu vertical secondary fluid>
            <Menu.Item fitted>
              <DecimalInput
                label=">="
                placeholder="Amount from"
                amountState={props.amountGeState}
              />
            </Menu.Item>
            <Menu.Item fitted>
              <DecimalInput
                label="<="
                placeholder="Amount to"
                amountState={props.amountLeState}
              />
            </Menu.Item>
            <Menu.Item fitted>
              <Checkbox
                label="Ignore sign"
                checked={isAmountAbs}
                onChange={(_, data) => setIsAmountAbs(data.checked || false)}
              />
            </Menu.Item>
          </Menu>
        </Popup>
        {(amountGe !== undefined || amountLe !== undefined) && (
          <Menu.Item fitted>
            <ClickableIcon
              name="remove circle"
              onClick={() => {
                setAmountGe(undefined);
                setAmountLe(undefined);
              }}
            />
          </Menu.Item>
        )}
      </Menu.Item>
      <MenuOrderButton isDescendingState={props.isDescendingState} />
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
