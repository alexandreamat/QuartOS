import {
  AccountApiOut,
  BodyPreviewApiUsersMeAccountsPreviewPost,
  api,
} from "app/services/api";
import FlexColumn from "components/FlexColumn";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import {
  Button,
  Card,
  Dimmer,
  Icon,
  Loader,
  Message,
  Modal,
} from "semantic-ui-react";
import { logMutationError } from "utils/error";
import UploadSegment from "components/UploadSegment";
import { useCheckboxes } from "hooks/useCheckboxes";
import { TransactionCard } from "features/transaction/components/TransactionCard";
import { useEffect, useMemo, useState } from "react";

export default function Uploader(props: {
  open: boolean;
  account: AccountApiOut;
  onClose: () => void;
}) {
  const checkboxes = useCheckboxes();
  const [showDupsWarn, setShowDupsWarn] = useState(false);

  const lastTransactionQuery =
    api.endpoints.readManyApiUsersMeTransactionsGet.useQuery({
      accountId: props.account.id,
      perPage: 1,
      page: 0,
    });

  const firstTransactionQuery =
    api.endpoints.readManyApiUsersMeTransactionsGet.useQuery({
      accountId: props.account.id,
      perPage: 1,
      page: 0,
      isDescending: false,
    });

  const [upload, uploadResult] =
    api.endpoints.previewApiUsersMeAccountsPreviewPost.useMutation();

  const transactionsIn = useMemo(
    () =>
      uploadResult.isSuccess
        ? [...uploadResult.data].sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          )
        : undefined,
    [uploadResult],
  );

  const lastTransaction = useMemo(
    () =>
      lastTransactionQuery.isSuccess && lastTransactionQuery.data.length
        ? lastTransactionQuery.data[0]
        : undefined,
    [lastTransactionQuery],
  );

  const firstTransaction = useMemo(
    () =>
      firstTransactionQuery.isSuccess && firstTransactionQuery.data.length
        ? firstTransactionQuery.data[0]
        : undefined,
    [firstTransactionQuery],
  );

  const handleClose = () => {
    setShowDupsWarn(false);
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

  useEffect(() => {
    if (!transactionsIn || !lastTransaction || !firstTransaction) return;

    transactionsIn.forEach((transactionIn, i) => {
      if (
        transactionIn.timestamp >= firstTransaction.timestamp &&
        transactionIn.timestamp <= lastTransaction.timestamp
      ) {
        setShowDupsWarn(true);
        checkboxes.onChange(i, false);
      } else {
        checkboxes.onChange(i, true);
      }
    });
  }, [transactionsIn, lastTransaction, firstTransaction]);

  const [createMovements, createMovementsResult] =
    api.endpoints.createManyApiUsersMeAccountsAccountIdMovementsPost.useMutation();

  const handleCreateTransactions = async () => {
    if (!uploadResult.data) return;

    const transactions = uploadResult.data.filter((_, i) =>
      checkboxes.checked.has(i),
    );
    try {
      await createMovements({
        accountId: props.account.id,
        bodyCreateManyApiUsersMeAccountsAccountIdMovementsPost: {
          transactions,
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
        <FlexColumn style={{ height: "calc(80vh - 10em)" }}>
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
          {showDupsWarn && (
            <Message warning icon>
              <Icon name="exclamation triangle" />
              <Message.Content>
                <Message.Header>Duplicate Entries Warning</Message.Header>
                The transactions sheet you have uploaded might overlap with
                existing transactions previously updated.
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
            {transactionsIn && (
              <Card.Group style={{ margin: 0 }}>
                {transactionsIn.map((t, i) => (
                  <TransactionCard
                    key={i}
                    transaction={t}
                    accountId={props.account.id}
                    checked={checkboxes.checked.has(i)}
                    onCheckedChange={(x) => {
                      checkboxes.onChange(i, x);
                    }}
                    preview
                  />
                ))}
              </Card.Group>
            )}
          </FlexColumn.Auto>
        </FlexColumn>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={!uploadResult.isSuccess || checkboxes.checked.size < 1}
          content={`Upload ${checkboxes.checked.size} ${
            checkboxes.checked.size === 1 ? "transaction" : "transactions"
          }`}
          labelPosition="right"
          icon="checkmark"
          onClick={handleCreateTransactions}
          positive
        />
      </Modal.Actions>
    </Modal>
  );
}
