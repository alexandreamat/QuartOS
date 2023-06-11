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
  Modal,
  Segment,
} from "semantic-ui-react";
import TransactionsTable from "./Table";
import { useAccountOptions } from "features/account/hooks";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { logMutationError } from "utils/error";

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
      logMutationError(error, uploadResult);
      return;
    }
  };

  const [createTransactions, createTransactionsResult] =
    api.endpoints.createApiTransactionsPost.useMutation();

  const handleCreateTransactions = async () => {
    try {
      await createTransactions(uploadResult.data!).unwrap();
    } catch (error) {
      logMutationError(error, createTransactionsResult);
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
            query={accountOptions}
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
          {uploadResult.isSuccess && (
            <TransactionsTable transactions={uploadResult.data} />
          )}
          <QueryErrorMessage query={uploadResult} />
          <QueryErrorMessage query={createTransactionsResult} />
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
