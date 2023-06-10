import { useState } from "react";
import { Confirm, Table } from "semantic-ui-react";
import ActionButton from "./ActionButton";

export default function DeleteCell(props: {
  onDelete: () => Promise<void>;
  confirmContent?: string;
  disabled?: boolean;
  isLoading: boolean;
  isError: boolean;
  error: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <Table.Cell collapsing>
      <ActionButton
        loading={props.isLoading}
        disabled={props.disabled}
        // content="Delete"
        icon="trash"
        onClick={() => setConfirmOpen(true)}
      />
      <Confirm
        open={confirmOpen}
        size="mini"
        confirmButton={{
          disabled: props.isError,
          loading: props.isLoading,
          content: "Delete",
        }}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          try {
            await props.onDelete();
          } catch (error) {
            console.log(error);
            return;
          }
          setConfirmOpen(false);
        }}
        content={props.isError ? props.error : props.confirmContent}
      />
    </Table.Cell>
  );
}
