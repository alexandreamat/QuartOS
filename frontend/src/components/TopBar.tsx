// Copyright (C) 2023 Alexandre Amat
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

import React from "react";
import { Icon, Menu, MenuItem } from "semantic-ui-react";
import { useAppDispatch } from "app/store";
import { useNavigate } from "react-router-dom";
import { unsetCredentials, unsetCurrentUser } from "features/auth/slice";
import { api } from "app/services/api";

export default function TopBar(props: { onToggleSidebar: () => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(unsetCredentials());
    dispatch(unsetCurrentUser());
    navigate("/");
  };

  const handleNameClick = () => {
    navigate("/profile");
  };

  const me = api.endpoints.readMeApiUsersMeGet.useQuery();

  return (
    <Menu color="teal" inverted style={{ borderRadius: 0 }}>
      <Menu.Menu position="left">
        <Menu.Item link onClick={props.onToggleSidebar}>
          <Icon name="bars" inverted />
        </Menu.Item>
      </Menu.Menu>
      <Menu.Menu position="right">
        <MenuItem onClick={handleNameClick}>{me.data?.full_name}</MenuItem>
        <Menu.Item onClick={handleLogout}>
          <Icon name="log out" />
        </Menu.Item>
      </Menu.Menu>
    </Menu>
  );
}
