import { FileApiOut, TransactionApiOut, api } from "app/services/api";
import { Button, Image, Loader, Modal } from "semantic-ui-react";
import ActionButton from "components/ActionButton";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import FlexRow from "components/FlexRow";
import { useState } from "react";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import ConfirmDeleteButtonModal from "components/ConfirmDeleteButtonModal";
import { logMutationError } from "utils/error";

export default function ModalFileViewer(props: {
  transaction: TransactionApiOut;
  files: FileApiOut[];
}) {
  const [open, setOpen] = useState(false);
  const [fileIdx, setFileIdx] = useState(0);

  const selectedFile = props.files[fileIdx];
  const fileQuery =
    api.endpoints.readApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesFileIdGet.useQuery(
      open
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

  async function handleDeleteFile() {
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
  }

  return (
    <Modal
      onClose={() => {
        setOpen(false);
        setFileIdx(0);
      }}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={
        <ActionButton
          tooltip="See files"
          icon="file"
          content={props.files.length.toFixed(0)}
        />
      }
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
            {fileQuery.isLoading || fileQuery.isUninitialized ? (
              <Loader active />
            ) : fileQuery.isError ? (
              <QueryErrorMessage query={fileQuery} />
            ) : fileQuery.data.type === "image/png" ? (
              <Image src={URL.createObjectURL(fileQuery.data)} />
            ) : fileQuery.data.type === "application/pdf" ? (
              <iframe
                src={URL.createObjectURL(fileQuery.data)}
                title={selectedFile.name}
                style={{
                  height: "70vh",
                  width: "100%",
                }}
              />
            ) : (
              <p>Unknown type {fileQuery.data.type}</p>
            )}
          </FlexRow.Auto>
          <ActionButton
            disabled={fileIdx >= props.files.length - 1}
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
        <Button positive onClick={() => setOpen(false)}>
          Close
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
