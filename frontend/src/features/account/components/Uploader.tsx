import {
  AccountApiOut,
  BodyPreviewApiUsersMeAccountsPreviewPost,
  api,
} from "app/services/api";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import TransactionsPreview from "features/transaction/components/TransactionsPreview";
import {
  Button,
  Dimmer,
  Form,
  Header,
  Icon,
  Loader,
  Modal,
  Segment,
} from "semantic-ui-react";
import { logMutationError } from "utils/error";

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

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) handleFileUpload(file);
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
      <Modal.Content scrolling>
        <Form>
          {(uploadResult.isUninitialized || uploadResult.isLoading) && (
            <Segment
              placeholder
              onDrop={handleFileDrop}
              onDragOver={(event: any) => event.preventDefault()}
            >
              <>
                <Header icon>
                  <Icon name="file excel outline" />
                  Upload your Transactions Sheet File
                </Header>
                <Button
                  as="label"
                  htmlFor="file-input"
                  primary
                  icon
                  labelPosition="left"
                >
                  <Icon name="cloud upload" />
                  Upload
                </Button>
                <input
                  type="file"
                  id="file-input"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                {uploadResult.isLoading && (
                  <Dimmer active>
                    <Loader active />
                  </Dimmer>
                )}
              </>
            </Segment>
          )}
          {uploadResult.isSuccess && (
            <TransactionsPreview
              transactionPages={[uploadResult.data]}
              accountId={props.account.id}
            />
          )}
          <QueryErrorMessage query={uploadResult} />
          <QueryErrorMessage query={createMovementsResult} />
        </Form>
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
