import { useState } from "react";
import { Confirm, Table } from "semantic-ui-react";
import ActionButton from "./ActionButton";
import { SimpleQuery } from "interfaces";
import { renderErrorMessage } from "utils/error";

export default function ConfirmDeleteButton(props: {
  onDelete: () => Promise<void>;
  confirmContent?: string;
  disabled?: boolean;
  query: SimpleQuery;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <>
      <ActionButton
        loading={props.query.isLoading}
        disabled={props.disabled}
        // content="Delete"
        icon="trash"
        onClick={() => setConfirmOpen(true)}
      />
      <Confirm
        open={confirmOpen}
        size="mini"
        confirmButton={{
          disabled: props.query.isError,
          loading: props.query.isLoading,
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
        content={
          props.query.isError
            ? renderErrorMessage(props.query.error!)
            : props.confirmContent
        }
      />
    </>
  );
}
