import { useAccountOptions } from "features/account/hooks";
import {
  Button,
  Dropdown,
  DropdownProps,
  Menu,
  Popup,
} from "semantic-ui-react";
import { ClickableIcon } from "components/ClickableIcon";

export default function MenuDropdownAccount(props: {
  accountId?: number;
  onAccountIdChange: (x: number) => void;
}) {
  const accountOptions = useAccountOptions();

  return (
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
  );
}
