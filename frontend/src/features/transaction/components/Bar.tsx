import { Button, Checkbox, Menu, Popup } from "semantic-ui-react";
import MenuDateInput from "components/MenuDateInput";
import { ClickableIcon } from "components/ClickableIcon";
import DecimalInput from "components/DecimalInput";
import MenuInputSearch from "components/MenuInputSearch";
import MenuDropdownAccount from "components/MenuDropdownAccount";
import MenuOrderButton from "components/MenuOrderButton";

export default function Bar(props: {
  accountId?: number;
  onAccountIdChange: (x: number) => void;
  search: string;
  onSearchChange: (x: string) => void;
  timestamp?: Date;
  onTimestampChange: (x: Date | undefined) => void;
  isDescending: boolean;
  onIsDescendingToggle: () => void;
  amountGe?: number;
  onAmountGeChange: (x?: number) => void;
  amountLe?: number;
  onAmountLeChange: (x?: number) => void;
  isAmountAbs: boolean;
  onIsAmountAbsChange: (x: boolean) => void;
  isMultipleChoice?: boolean;
  onIsMultipleChoiceChange: (x: boolean) => void;
}) {
  return (
    <Menu secondary>
      <MenuInputSearch
        search={props.search}
        onSearchChange={props.onSearchChange}
      />
      <MenuDropdownAccount
        accountId={props.accountId}
        onAccountIdChange={props.onAccountIdChange}
      />
      <MenuDateInput
        label="from"
        date={props.timestamp}
        onDateChange={props.onTimestampChange}
      />
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
                amount={props.amountGe}
                onAmountChange={props.onAmountGeChange}
              />
            </Menu.Item>
            <Menu.Item fitted>
              <DecimalInput
                label="<="
                placeholder="Amount to"
                amount={props.amountLe}
                onAmountChange={props.onAmountLeChange}
              />
            </Menu.Item>
            <Menu.Item fitted>
              <Checkbox
                label="Ignore sign"
                checked={props.isAmountAbs}
                onChange={(_, data) =>
                  props.onIsAmountAbsChange(data.checked || false)
                }
              />
            </Menu.Item>
          </Menu>
        </Popup>
        {(props.amountGe !== undefined || props.amountLe !== undefined) && (
          <Menu.Item fitted>
            <ClickableIcon
              name="remove circle"
              onClick={() => {
                props.onAmountGeChange(undefined);
                props.onAmountLeChange(undefined);
              }}
            />
          </Menu.Item>
        )}
      </Menu.Item>
      <MenuOrderButton
        isDescending={props.isDescending}
        onIsDescendingToggle={props.onIsDescendingToggle}
      />
      <Menu.Item fitted>
        <Button
          icon="check square"
          toggle
          active={props.isMultipleChoice}
          onClick={() =>
            props.onIsMultipleChoiceChange(!props.isMultipleChoice)
          }
        />
      </Menu.Item>
    </Menu>
  );
}
