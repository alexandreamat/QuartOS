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
