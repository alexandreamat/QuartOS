import { useAccountOptions } from "features/account/hooks";
import { Button, Dropdown, Menu, Popup } from "semantic-ui-react";
import ClickableIcon from "components/ClickableIcon";
import { UseStateType } from "types";

export default function MenuDropdownAccount(props: {
  accountIdState: UseStateType<number | undefined>;
}) {
  const accountOptions = useAccountOptions();
  const [accountId, setAccountId] = props.accountIdState;
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
          value={accountId}
          options={accountOptions.options || []}
          onChange={(_, data) => setAccountId(data.value as number)}
          loading={accountOptions.query.isLoading}
          error={accountOptions.query.isError}
        />
      </Popup>
      {accountId !== undefined && (
        <Menu.Item fitted>
          <ClickableIcon
            name="remove circle"
            onClick={() => setAccountId(undefined)}
          />
        </Menu.Item>
      )}
    </Menu.Item>
  );
}
