import { BodyUploadTransactionsSheetApiAccountsIdTransactionsSheetPost } from "app/services/api";
import { api } from "app/services/api";
import FormDropdownInput from "components/FormDropdownInput";
import useFormField from "hooks/useFormField";
import { useEffect } from "react";
import {
  Button,
  Dimmer,
  Form,
  Header,
  Icon,
  Loader,
  Message,
  Modal,
  Segment,
} from "semantic-ui-react";
import TransactionsTable from "./Table";
import { renderErrorMessage } from "utils/error";
import { useAccountOptions } from "features/account/hooks";

export default function Uploader(props: {
  open: boolean;
  accountId: number;
  onClose: () => void;
}) {
  const accountId = useFormField(0);

  useEffect(() => {
    if (props.accountId) accountId.set(props.accountId);
  }, [props.accountId]);

  const accountOptions = useAccountOptions();

  const [upload, uploadResult] =
    api.endpoints.uploadTransactionsSheetApiAccountsIdTransactionsSheetPost.useMutation();

  const handleClose = () => {
    accountId.reset();
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
    if (!accountId.validate()) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await upload({
        id: accountId.value!,
        bodyUploadTransactionsSheetApiAccountsIdTransactionsSheetPost:
          formData as unknown as BodyUploadTransactionsSheetApiAccountsIdTransactionsSheetPost,
      }).unwrap();
    } catch (error) {
      console.error(error);
      console.error(uploadResult.error);
    }
  };

  const [createTransactions, createTransactionsResult] =
    api.endpoints.createApiTransactionsPost.useMutation();

  const handleCreateTransactions = async () => {
    try {
      await createTransactions(uploadResult.data!).unwrap();
    } catch (error) {
      console.error(error);
      console.error(createTransactionsResult.error);
      console.error(createTransactionsResult.originalArgs);
      return;
    }
    handleClose();
  };

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Modal.Header>Upload Transactions File</Modal.Header>
      <Modal.Content scrolling>
        <Form>
          <FormDropdownInput
            label="Account"
            field={accountId}
            options={accountOptions.data || []}
            loading={accountOptions.isLoading}
            error={accountOptions.isError}
          />
          {(uploadResult.isUninitialized || uploadResult.isLoading) && (
            <Segment
              disabled={!accountId.value}
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
                  disabled={!accountId.value}
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
          {uploadResult.isError && (
            <Message negative icon>
              <Icon name="exclamation triangle" />
              <Message.Content>
                <Message.Header>Encountered Error</Message.Header>
                {renderErrorMessage(uploadResult.error)}
              </Message.Content>
            </Message>
          )}
          {uploadResult.isSuccess && (
            <TransactionsTable transactions={uploadResult.data} />
          )}
          {createTransactionsResult.isError && (
            <Message negative icon>
              <Icon name="exclamation triangle" />
              <Message.Content>
                <Message.Header>Encountered Error</Message.Header>
                {renderErrorMessage(createTransactionsResult.error)}
              </Message.Content>
            </Message>
          )}
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
