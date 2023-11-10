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

import { Table } from "semantic-ui-react";
import CreateNewButton from "./CreateNewButton";

export default function TableFooter(props: {
  columns: number;
  onCreate: () => void;
}) {
  return (
    <Table.Footer>
      <Table.Row>
        <Table.HeaderCell colSpan={props.columns}>
          <CreateNewButton onCreate={props.onCreate} />
        </Table.HeaderCell>
      </Table.Row>
    </Table.Footer>
  );
}
