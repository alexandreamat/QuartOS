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

import { ReactNode } from "react";
import { Button, Menu } from "semantic-ui-react";

export default function SpanButton(props: {
  loading?: boolean;
  negative?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <Menu secondary>
      <Menu.Item style={{ width: "100%" }}>
        <Button
          fluid
          positive
          circular
          disabled={props.disabled}
          onClick={props.onClick}
          loading={props.loading}
          negative={props.negative}
        >
          {props.children}
        </Button>
      </Menu.Item>
    </Menu>
  );
}
