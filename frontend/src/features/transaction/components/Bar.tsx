import { useAccountOptions } from "features/account/hooks";
import {
  Button,
  Dropdown,
  DropdownProps,
  Icon,
  Input,
  InputOnChangeData,
  Menu,
} from "semantic-ui-react";
import MenuDateInput from "components/MenuDateInput";
import { ClickableIcon } from "components/ClickableIcon";

export default function Bar(props: {
  accountId: number;
  onAccountIdChange: (x: number) => void;
  search: string;
  onSearchChange: (x: string) => void;
  timestamp?: Date;
  onTimestampChange: (x: Date | undefined) => void;
  isDescending: boolean;
  onToggleIsDescending: () => void;
  amountGe?: number;
  onAmountGeChange: (x?: number) => void;
  amountLe?: number;
  onAmountLeChange: (x?: number) => void;
}) {
  const accountOptions = useAccountOptions();

  const amountGeStr = props.amountGe !== undefined ? props.amountGe : "";
  const amountLeStr = props.amountLe !== undefined ? props.amountLe : "";

  return (
    <Menu secondary style={{ width: "100%" }}>
      <Menu.Item>
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
      <Menu.Item>
        <Dropdown
          icon="filter"
          labeled
          className="icon"
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
        {props.accountId !== 0 && (
          <Menu.Item fitted>
            <ClickableIcon
              name="remove circle"
              onClick={() => props.onAccountIdChange(0)}
            />
          </Menu.Item>
        )}
      </Menu.Item>
      <Menu.Item>
        <MenuDateInput
          label="from"
          date={props.timestamp}
          onDateChange={props.onTimestampChange}
        />
        <Menu.Item fitted>
          <Button icon onClick={props.onToggleIsDescending}>
            <Icon
              name={props.isDescending ? "sort amount down" : "sort amount up"}
            />
          </Button>
        </Menu.Item>
      </Menu.Item>
      <Menu.Item>
        <Input
          label="from"
          type="number"
          input={{
            inputMode: "decimal",
            step: "0.01",
          }}
          placeholder="Amount from"
          value={amountGeStr}
          onChange={(_, data) => {
            if (data.value.length) {
              const newAmount = Number(data.value);
              if (isNaN(newAmount)) return;
              props.onAmountGeChange(newAmount);
            } else {
              props.onAmountGeChange(undefined);
            }
          }}
        />
        {props.amountGe !== undefined && (
          <Menu.Item fitted>
            <ClickableIcon
              name="remove circle"
              onClick={() => props.onAmountGeChange(undefined)}
            />
          </Menu.Item>
        )}
        <Input
          label="to"
          type="number"
          input={{
            inputMode: "decimal",
            step: "0.01",
          }}
          placeholder="Amount to"
          value={amountLeStr}
          onChange={(_, data) => {
            if (data.value.length) {
              const newAmount = Number(data.value);
              if (isNaN(newAmount)) return;
              props.onAmountLeChange(newAmount);
            } else {
              props.onAmountLeChange(undefined);
            }
          }}
        />
        {props.amountLe !== undefined && (
          <Menu.Item fitted>
            <ClickableIcon
              name="remove circle"
              onClick={() => props.onAmountLeChange(undefined)}
            />
          </Menu.Item>
        )}
      </Menu.Item>
    </Menu>
  );
}
