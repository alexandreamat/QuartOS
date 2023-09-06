import {
  AccountApiOut,
  BodyPreviewApiUsersMeAccountsPreviewPost,
  api,
} from "app/services/api";
import FlexColumn from "components/FlexColumn";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import TransactionsPreview from "features/transaction/components/TransactionsPreview";
import {
  Button,
  Dimmer,
  Icon,
  Loader,
  Message,
  Modal,
} from "semantic-ui-react";
import { logMutationError } from "utils/error";
import UploadSegment from "components/UploadSegment";

export default function Uploader(props: {
  open: boolean;
  account: AccountApiOut;
  onClose: () => void;
}) {
  const [upload, uploadResult] =
    api.endpoints.previewApiUsersMeAccountsPreviewPost.useMutation();

  const handleClose = () => {
    uploadResult.reset();
    props.onClose();
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      await upload({
        accountId: props.account.id,
        bodyPreviewApiUsersMeAccountsPreviewPost:
          formData as unknown as BodyPreviewApiUsersMeAccountsPreviewPost,
      }).unwrap();
    } catch (error) {
      logMutationError(error, uploadResult);
      return;
    }
  };

  const [createMovements, createMovementsResult] =
    api.endpoints.createManyApiUsersMeAccountsAccountIdMovementsPost.useMutation();

  const handleCreateTransactions = async () => {
    try {
      await createMovements({
        accountId: props.account.id,
        bodyCreateManyApiUsersMeAccountsAccountIdMovementsPost: {
          transactions: uploadResult.data!,
          transaction_ids: [],
        },
      }).unwrap();
    } catch (error) {
      logMutationError(error, createMovementsResult);
      return;
    }
    handleClose();
  };

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Modal.Header>Upload Transactions File</Modal.Header>
      <Modal.Content>
        <div style={{ height: "70vh" }}>
          <FlexColumn>
            {props.account.is_synced && (
              <Message warning icon>
                <Icon name="exclamation triangle" />
                <Message.Content>
                  <Message.Header>Synced Account</Message.Header>
                  You are about to upload transactions for an account that is
                  synced with your institution. This is only advised to upload
                  transactions that cannot be synced automatically.
                </Message.Content>
              </Message>
            )}
            {uploadResult.isUninitialized && (
              <UploadSegment onUpload={handleFileUpload} />
            )}
            {uploadResult.isLoading && (
              <Dimmer active>
                <Loader active />
              </Dimmer>
            )}
            {createMovementsResult.isLoading && (
              <Dimmer active>
                <Loader active />
              </Dimmer>
            )}
            <QueryErrorMessage query={uploadResult} />
            <QueryErrorMessage query={createMovementsResult} />
            <FlexColumn.Auto>
              {uploadResult.isSuccess && (
                <TransactionsPreview
                  transactionPages={[uploadResult.data]}
                  accountId={props.account.id}
                />
              )}
            </FlexColumn.Auto>
          </FlexColumn>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={!uploadResult.isSuccess}
          content="Confirm"
          type="submit"
          labelPosition="right"
          icon="checkmark"
          onClick={handleCreateTransactions}
          positive
        />
      </Modal.Actions>
    </Modal>
  );
}
