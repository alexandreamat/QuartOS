import { Button, Menu } from "semantic-ui-react";
import MenuDateInput from "components/MenuDateInput";
import MenuInputSearch from "components/MenuInputSearch";
import MenuDropdownAccount from "components/MenuDropdownAccount";
import MenuOrderButton from "components/MenuOrderButton";

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
  return (
    <Menu secondary>
      <Menu.Item fitted>
        <Button icon="plus" circular primary onClick={props.onOpenCreateForm} />
      </Menu.Item>
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
        date={props.startDate}
        onDateChange={props.onStartDateChange}
      />
      <MenuDateInput
        label="to"
        date={props.endDate}
        onDateChange={props.onEndDateChange}
      />
      <MenuOrderButton
        isDescending={props.isDescending}
        onIsDescendingToggle={props.onToggleIsDescending}
      />
    </Menu>
  );
}
