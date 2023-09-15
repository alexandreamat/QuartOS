import { BaseQueryFn } from "@reduxjs/toolkit/dist/query";
import { TypedUseMutationResult } from "@reduxjs/toolkit/dist/query/react";
import { useState } from "react";
import { Button, Confirm } from "semantic-ui-react";
import { renderErrorMessage } from "utils/error";

export default function ConfirmDeleteButtonModal<
  R,
  A,
  Q extends BaseQueryFn,
>(props: {
  onDelete: () => Promise<void>;
  confirmContent?: string;
  disabled?: boolean;
  query: TypedUseMutationResult<R, A, Q>;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <>
      <Button
        negative
        floated="left"
        labelPosition="left"
        content="Delete"
        loading={props.query.isLoading}
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
            ? renderErrorMessage(props.query.error)
            : props.confirmContent
        }
      />
    </>
  );
}
