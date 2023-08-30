import {
  Button,
  Dropdown,
  DropdownProps,
  Icon,
  Input,
  InputOnChangeData,
  Menu,
} from "semantic-ui-react";
import { useAccountOptions } from "features/account/hooks";
import MenuDateInput from "components/MenuDateInput";
import { ClickableIcon } from "components/ClickableIcon";

export function Bar(props: {
  onOpenCreateForm: () => void;
  search: string;
  onSearchChange: (x: string) => void;
  startDate?: Date;
  onStartDateChange: (x: Date | undefined) => void;
  endDate?: Date;
  onEndDateChange: (x: Date | undefined) => void;
  accountId: number;
  onAccountIdChange: (x: number) => void;
  isDescending: boolean;
  onToggleIsDescending: () => void;
}) {
  const accountOptions = useAccountOptions();

  return (
    <Menu secondary>
      <Menu.Item fitted>
        <Button icon="plus" primary onClick={props.onOpenCreateForm}></Button>
      </Menu.Item>
      <Menu.Item fitted>
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
      <MenuDateInput
        label="from"
        date={props.startDate}
        onDateChange={props.onStartDateChange}
      />
      <MenuDateInput
        label="to"
        date={props.endDate}
        onDateChange={props.onEndDateChange}
      />
      <Menu.Item fitted>
        <Button icon onClick={props.onToggleIsDescending}>
          <Icon
            name={props.isDescending ? "sort amount down" : "sort amount up"}
          />
        </Button>
      </Menu.Item>
    </Menu>
  );
}
