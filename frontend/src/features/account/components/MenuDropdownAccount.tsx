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

import ClickableIcon from "components/ClickableIcon";
import { useAccountOptions } from "features/account/hooks";
import { Button, Dropdown, Menu, Popup } from "semantic-ui-react";
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
