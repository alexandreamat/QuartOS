import { useState } from "react";
import { Confirm, SemanticFLOATS } from "semantic-ui-react";
import ActionButton from "./ActionButton";
import { SimpleQuery } from "interfaces";
import { renderErrorMessage } from "utils/error";

export default function ConfirmDeleteButton(props: {
  onDelete: () => Promise<void>;
  confirmContent?: string;
  disabled?: boolean;
  query: SimpleQuery;
  floated?: SemanticFLOATS;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <>
      <ActionButton
        floated={props.floated}
        tooltip="delete"
        loading={props.query.isLoading}
        negative={props.query.isError}
        disabled={props.disabled}
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
            console.error(error);
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
