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
