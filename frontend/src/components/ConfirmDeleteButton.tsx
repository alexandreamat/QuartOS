import { useState } from "react";
import { Confirm, SemanticFLOATS } from "semantic-ui-react";
import ActionButton from "./ActionButton";
import { renderErrorMessage } from "utils/error";
import { BaseQueryFn } from "@reduxjs/toolkit/dist/query";
import { TypedUseMutationResult } from "@reduxjs/toolkit/dist/query/react";

export default function ConfirmDeleteButton<
  R,
  A,
  Q extends BaseQueryFn,
>(props: {
  onDelete: () => Promise<void>;
  confirmContent?: string;
  disabled?: boolean;
  query: TypedUseMutationResult<R, A, Q>;
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
