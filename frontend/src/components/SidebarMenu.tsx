import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon, Menu } from "semantic-ui-react";
import routes from "../router/routes";
import { ReactComponent as Logo } from "./Logo/logo.svg";
import { useAppSelector } from "app/store";

export default function SidebarMenu() {
  const location = useLocation();
  const current_user = useAppSelector((state) => state.auth.current_user);
  return (
    <Menu
      vertical
      inverted
      style={{ height: "100vh", borderRadius: 0, width: "100%" }}
    >
      <Menu.Item>
        <Logo height="100px" width="100%" />
      </Menu.Item>
      {routes
        .filter((r) => current_user?.is_superuser || !r.requires_superuser)
        .map((route) => (
          <Menu.Item
            as={Link}
            key={route.path}
            to={route.link || route.path}
            active={location.pathname === route.path}
          >
            {route.label}
            <Icon name={route.icon} />
            {route.requires_superuser && <Icon name="lock open" />}
          </Menu.Item>
        ))}
    </Menu>
  );
}
