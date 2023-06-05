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
