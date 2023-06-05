import { Table } from "semantic-ui-react";
import ActionButton from "./ActionButton";

export default function EditCell(props: {
  onEdit: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Table.Cell collapsing>
      <ActionButton
        loading={props.loading}
        disabled={props.disabled}
        // content="Edit"
        icon="pencil"
        onClick={() => props.onEdit()}
      />
    </Table.Cell>
  );
}
