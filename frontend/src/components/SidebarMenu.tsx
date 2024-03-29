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

import { useAppSelector } from "app/store";
import { Link, useLocation } from "react-router-dom";
import routes from "router";
import { Icon, Menu } from "semantic-ui-react";
import { ReactComponent as Logo } from "./Logo/logo.svg";

export default function SidebarMenu(props: { fluid?: boolean }) {
  const location = useLocation();
  const current_user = useAppSelector((state) => state.auth.current_user);
  return (
    <Menu
      vertical
      inverted
      fluid={props.fluid}
      style={{ height: "100vh", borderRadius: 0 }}
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
