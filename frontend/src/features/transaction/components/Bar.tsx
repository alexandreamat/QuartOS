import { useAccountOptions } from "features/account/hooks";
import {
  Button,
  Divider,
  Dropdown,
  DropdownProps,
  Icon,
  Input,
  InputOnChangeData,
  Menu,
  Popup,
} from "semantic-ui-react";
import MenuDateInput from "components/MenuDateInput";
import { ClickableIcon } from "components/ClickableIcon";
import DecimalInput from "components/DecimalInput";

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
  isMultipleChoice?: boolean;
  onIsMultipleChoiceChange: (x: boolean) => void;
}) {
  const accountOptions = useAccountOptions();

  return (
    <Menu secondary>
      <Menu.Item fitted style={{ flex: 1 }}>
        <Input
          icon="search"
          placeholder="Search..."
          value={props.search}
          onChange={(
            event: React.ChangeEvent<HTMLInputElement>,
            data: InputOnChangeData
          ) => props.onSearchChange(data.value as string)}
        />
      </Menu.Item>
      <Menu.Item fitted>
        <Popup
          trigger={<Button icon="filter" />}
          hoverable
          position="bottom right"
          on="click"
        >
          <Dropdown
            button
            placeholder="Filter by account"
            search
            selection
            value={props.accountId}
            options={accountOptions.data || []}
            onChange={(
              event: React.SyntheticEvent<HTMLElement>,
              data: DropdownProps
            ) => props.onAccountIdChange(data.value as number)}
          />
        </Popup>
        {props.accountId !== 0 && (
          <Menu.Item fitted>
            <ClickableIcon
              name="remove circle"
              onClick={() => props.onAccountIdChange(0)}
            />
          </Menu.Item>
        )}
      </Menu.Item>
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
          <DecimalInput
            label=">="
            placeholder="Amount from"
            amount={props.amountGe}
            onAmountChange={props.onAmountGeChange}
          />
          {props.amountGe !== undefined && props.amountLe !== undefined ? (
            <div
              onClick={() => {
                props.onAmountGeChange(props.amountLe);
                props.onAmountLeChange(props.amountGe);
              }}
              style={{ cursor: "pointer" }}
            >
              <Divider horizontal>
                {props.amountGe < props.amountLe ? "and" : "or"}
              </Divider>
            </div>
          ) : (
            <Divider />
          )}
          <DecimalInput
            label="<="
            placeholder="Amount to"
            amount={props.amountLe}
            onAmountChange={props.onAmountLeChange}
          />
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
      <Menu.Item fitted>
        <Button icon onClick={props.onIsDescendingToggle}>
          <Icon
            name={props.isDescending ? "sort amount down" : "sort amount up"}
          />
        </Button>
      </Menu.Item>
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
