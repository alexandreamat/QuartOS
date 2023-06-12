import { Table } from "semantic-ui-react";
import ActionButton from "./ActionButton";

export default function EditCell(props: {
  onOpenEditForm: () => void;
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
        onClick={() => props.onOpenEditForm()}
      />
    </Table.Cell>
  );
}
