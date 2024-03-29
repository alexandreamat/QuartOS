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

import { skipToken } from "@reduxjs/toolkit/dist/query";
import { TransactionApiOut, api } from "app/services/api";
import ActionButton from "components/ActionButton";
import ConfirmDeleteButtonModal from "components/ConfirmDeleteButtonModal";
import FlexRow from "components/FlexRow";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { useState } from "react";
import { Button, Image, Loader, Modal } from "semantic-ui-react";
import { logMutationError } from "utils/error";

function FileContent(props: { blob: Blob }) {
  if (props.blob.type === "image/png")
    return <Image src={URL.createObjectURL(props.blob)} />;

  if (props.blob.type === "application/pdf")
    return (
      <iframe
        src={URL.createObjectURL(props.blob)}
        title={props.blob.type}
        style={{
          height: "70vh",
          width: "100%",
        }}
      />
    );

  return <p>Unknown type {props.blob.type}</p>;
}

export default function ModalFileViewer(props: {
  onClose: () => void;
  transaction: TransactionApiOut;
}) {
  const [fileIdx, setFileIdx] = useState(0);

  const filesQuery =
    api.endpoints.readManyUsersMeAccountsAccountIdTransactionsTransactionIdFilesGet.useQuery(
      {
        accountId: props.transaction.account_id,
        transactionId: props.transaction.id,
      },
    );

  const selectedFile = filesQuery.data ? filesQuery.data[fileIdx] : undefined;

  const fileQuery =
    api.endpoints.readUsersMeAccountsAccountIdTransactionsTransactionIdFilesFileIdGet.useQuery(
      selectedFile
        ? {
            accountId: props.transaction.account_id,
            transactionId: props.transaction.id,
            fileId: selectedFile.id,
          }
        : skipToken,
    );

  const [deleteFile, deleteFileResult] =
    api.endpoints.deleteUsersMeAccountsAccountIdTransactionsTransactionIdFilesFileIdDelete.useMutation();

  async function handleDeleteFile() {
    if (!selectedFile || !filesQuery.data) return;

    try {
      await deleteFile({
        accountId: props.transaction.account_id,
        transactionId: props.transaction.id,
        fileId: selectedFile.id,
      }).unwrap();
    } catch (error) {
      logMutationError(error, deleteFileResult);
    }
    const newLength = filesQuery.data.length - 1;
    if (newLength) setFileIdx((x) => Math.min(newLength - 1, x));
    else props.onClose();
  }

  return (
    <Modal onClose={props.onClose} open size="large">
      <Modal.Content>
        <FlexRow alignItems="center" gap="10px">
          <ActionButton
            disabled={fileIdx <= 0}
            icon="arrow left"
            onClick={() => setFileIdx((x) => x - 1)}
            tooltip="Previous file"
          />
          <FlexRow.Auto>
            {fileQuery.isFetching || filesQuery.isFetching ? (
              <Loader active />
            ) : fileQuery.isError ? (
              <QueryErrorMessage query={fileQuery} />
            ) : (
              fileQuery.isSuccess &&
              filesQuery.isSuccess && <FileContent blob={fileQuery.data} />
            )}
          </FlexRow.Auto>
          {/* <ActionButton
            disabled={fileIdx >= props.transaction.files.length - 1}
            icon="arrow right"
            onClick={() => setFileIdx((x) => x + 1)}
            tooltip="Next file"
          /> */}
        </FlexRow>
      </Modal.Content>
      <Modal.Actions>
        <ConfirmDeleteButtonModal
          onSubmit={handleDeleteFile}
          query={deleteFileResult}
        />
        <Button positive onClick={props.onClose}>
          Close
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
