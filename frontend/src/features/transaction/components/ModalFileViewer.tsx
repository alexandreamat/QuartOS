import { TransactionApiOut, api } from "app/services/api";
import { Button, Image, Loader, Modal } from "semantic-ui-react";
import ActionButton from "components/ActionButton";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import FlexRow from "components/FlexRow";
import React, { ReactNode, useState } from "react";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import ConfirmDeleteButtonModal from "components/ConfirmDeleteButtonModal";
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
  transaction: TransactionApiOut;
  trigger: ReactNode;
  onMutation?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [fileIdx, setFileIdx] = useState(0);

  const filesQuery =
    api.endpoints.readManyApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesGet.useQuery(
      open
        ? {
            accountId: props.transaction.account_id,
            movementId: props.transaction.movement_id,
            transactionId: props.transaction.id,
          }
        : skipToken
    );

  const selectedFile = filesQuery.data ? filesQuery.data[fileIdx] : undefined;

  const fileQuery =
    api.endpoints.readApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesFileIdGet.useQuery(
      open && selectedFile
        ? {
            accountId: props.transaction.account_id,
            movementId: props.transaction.movement_id,
            transactionId: props.transaction.id,
            fileId: selectedFile.id,
          }
        : skipToken
    );

  const [deleteFile, deleteFileResult] =
    api.endpoints.deleteApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesFileIdDelete.useMutation();

  function handleClose() {
    setOpen(false);
    setFileIdx(0);
  }

  async function handleDeleteFile() {
    if (!selectedFile || !filesQuery.data) return;

    try {
      await deleteFile({
        accountId: props.transaction.account_id,
        movementId: props.transaction.movement_id,
        transactionId: props.transaction.id,
        fileId: selectedFile.id,
      }).unwrap();
    } catch (error) {
      logMutationError(error, deleteFileResult);
    }
    props.onMutation && props.onMutation();
    const newLength = filesQuery.data.length - 1;
    if (newLength) setFileIdx((x) => Math.min(newLength - 1, x));
    else handleClose();
  }

  return (
    <Modal
      onClose={handleClose}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={props.trigger}
      size="large"
    >
      <Modal.Content>
        <FlexRow style={{ alignItems: "center" }}>
          <ActionButton
            disabled={fileIdx <= 0}
            icon="arrow left"
            onClick={() => setFileIdx((x) => x - 1)}
            tooltip="Previous file"
            style={{ marginRight: "10px" }}
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
          <ActionButton
            disabled={fileIdx >= props.transaction.files.length - 1}
            icon="arrow right"
            onClick={() => setFileIdx((x) => x + 1)}
            tooltip="Next file"
            style={{ marginLeft: "10px" }}
          />
        </FlexRow>
      </Modal.Content>
      <Modal.Actions>
        <ConfirmDeleteButtonModal
          onDelete={handleDeleteFile}
          query={deleteFileResult}
        />
        <Button positive onClick={handleClose}>
          Close
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
