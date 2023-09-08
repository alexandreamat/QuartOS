import { skipToken } from "@reduxjs/toolkit/dist/query";
import {
  MovementApiOut,
  TransactionApiIn,
  TransactionApiOut,
  api,
} from "app/services/api";
import FormCurrencyInput from "components/FormCurrencyInput";
import FormDateTimeInput from "components/FormDateTimeInput";
import FormDropdownInput from "components/FormDropdownInput";
import FormTextInput from "components/FormTextInput";
import { FormValidationError } from "components/FormValidationError";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { useAccountOptions } from "features/account/hooks";
import useFormField from "hooks/useFormField";
import { useEffect } from "react";
import {
  Icon,
  Message,
  Modal,
  Form,
  Button,
  Placeholder,
} from "semantic-ui-react";
import { logMutationError } from "utils/error";
import { TransactionApiInForm } from "../types";
import { transactionApiOutToForm, transactionFormToApiIn } from "../utils";
import CurrencyExchangeTips from "./CurrencyExchangeTips";
import { SimpleQuery } from "interfaces";
import ConfirmDeleteButtonModal from "components/ConfirmDeleteButtonModal";
import UploadButton from "components/UploadButton";
import { useUploadTransactionFile } from "../hooks/useUploadTransactionFile";

export default function TransactionForm(
  props: {
    // Common
    title: string;
    open: boolean;
    onClose: () => void;
  } & (
    | {
        // Create tx
        onSubmit: (x: TransactionApiIn, y: number) => Promise<void>;
        submitResult: SimpleQuery;
      }
    | {
        // Add new tx to movement
        movementId: number;
        onSubmit: (x: TransactionApiIn, y: number) => Promise<void>;
        submitResult: SimpleQuery;
      }
    | {
        // Edit existing tx
        movementId: number;
        transaction: TransactionApiOut;
        onSubmit: (x: TransactionApiIn, y: number) => Promise<void>;
        submitResult: SimpleQuery;
        onDelete: () => Promise<void>;
        deleteResult: SimpleQuery;
        onUpload: (file: File) => void;
        uploadResult: SimpleQuery;
      }
  )
) {
  const isEdit = "transaction" in props;
  const hasMovement = "movementId" in props;

  const filesQuery =
    api.endpoints.readManyApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesGet.useQuery(
      isEdit
        ? {
            accountId: props.transaction.account_id,
            movementId: props.transaction.movement_id,
            transactionId: props.transaction.id,
          }
        : skipToken
    );

  const form: TransactionApiInForm = {
    amountStr: useFormField(
      isEdit ? props.transaction.amount.toFixed(2) : "",
      "amount"
    ),
    timestamp: useFormField(
      isEdit ? new Date(props.transaction.timestamp) : new Date(),
      "date"
    ),
    name: useFormField(isEdit ? props.transaction.name : "", "name"),
    accountId: useFormField(
      isEdit ? props.transaction.account_id : 0,
      "account"
    ),
  };

  const accountQuery =
    api.endpoints.readApiUsersMeAccountsAccountIdGet.useQuery(
      form.accountId.value || skipToken
    );

  const movementQuery =
    api.endpoints.readApiUsersMeMovementsMovementIdGet.useQuery(
      hasMovement ? props.movementId : skipToken
    );

  const disableSynced = isEdit && accountQuery.data?.is_synced;

  const accountOptions = useAccountOptions();

  useEffect(() => {
    if (isEdit) return;
    if (!movementQuery.isSuccess) return;
    const movement = movementQuery.data;
    const timestamp = movement.earliest_timestamp;
    form.timestamp.set(timestamp ? new Date(timestamp) : new Date());
    form.name.set(movement.name);
  }, [movementQuery.isSuccess, movementQuery.data, props.open]);

  useEffect(() => {
    isEdit && transactionApiOutToForm(props.transaction, form);
  }, [isEdit, props.open]);

  const handleSubmit = async () => {
    const invalidFields = Object.values(form).filter(
      (field) => !field.validate()
    );
    if (invalidFields.length > 0) return;
    const transactionIn = transactionFormToApiIn(form);
    try {
      await props.onSubmit(transactionIn, form.accountId.value!);
    } catch (error) {
      return;
    }
    handleClose();
  };

  async function handleDelete() {
    if (!isEdit || !props.onDelete) return;
    try {
      await props.onDelete();
    } catch (error) {
      return;
    }
    handleClose();
  }

  const handleClose = () => {
    Object.values(form).forEach((field) => field.reset());
    props.onClose();
  };

  const { timestamp, ...comparableForm } = form;
  const hasChanged =
    isEdit &&
    (Object.values(comparableForm).some((v) => v.hasChanged) ||
      timestamp.value?.getTime() !==
        new Date(props.transaction.timestamp).getTime());

  return (
    <Modal open={props.open} onClose={handleClose} size="small">
      <Modal.Header>{props.title}</Modal.Header>
      <Modal.Content>
        <Form>
          <FormDropdownInput
            field={form.accountId}
            options={accountOptions.data || []}
            query={accountOptions}
            readOnly={disableSynced}
          />
          <FormCurrencyInput
            query={accountQuery}
            field={form.amountStr}
            currency={accountQuery.data?.currency_code}
            readOnly={disableSynced}
          />
          {movementQuery.isSuccess && accountQuery.data?.currency_code && (
            <CurrencyExchangeTips
              relatedTransactions={movementQuery.data.transactions}
              currencyCode={accountQuery.data.currency_code}
            />
          )}
          <FormTextInput field={form.name} readOnly={disableSynced} />
          <FormDateTimeInput field={form.timestamp} readOnly={disableSynced} />
          <FormValidationError fields={Object.values(form)} />
          <QueryErrorMessage query={props.submitResult} />
          {disableSynced && (
            <Message info icon>
              <Icon name="info circle" />
              <Message.Content>
                This transaction is synchronised with your institution, and is
                not fully editable.
              </Message.Content>
            </Message>
          )}
          {isEdit && (
            <>
              <UploadButton
                disabled={!filesQuery.isSuccess}
                onUpload={props.onUpload}
                negative={props.uploadResult.isError}
                loading={props.uploadResult.isLoading}
              />
              {filesQuery.isFetching || filesQuery.isUninitialized ? (
                <Placeholder as="p">
                  <Placeholder.Line />
                </Placeholder>
              ) : filesQuery.isError ? (
                <QueryErrorMessage query={filesQuery} />
              ) : (
                filesQuery.isSuccess && (
                  <p>
                    {filesQuery.data.length === 0
                      ? "No files uploaded"
                      : filesQuery.data.length === 1
                      ? "1 File uploaded"
                      : `${filesQuery.data.length} files uploaded`}
                  </p>
                )
              )}
            </>
          )}
        </Form>
      </Modal.Content>
      <Modal.Actions>
        {isEdit && (
          <ConfirmDeleteButtonModal
            onDelete={handleDelete}
            query={props.deleteResult}
          />
        )}
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={!hasChanged}
          content="Save"
          type="submit"
          labelPosition="right"
          icon="checkmark"
          onClick={handleSubmit}
          positive
        />
      </Modal.Actions>
    </Modal>
  );
}

function FormCreate(props: {
  open: boolean;
  onClose: () => void;
  onCreated: (x: MovementApiOut) => void;
}) {
  const [createMovement, createMovementResult] =
    api.endpoints.createManyApiUsersMeAccountsAccountIdMovementsPost.useMutation();

  const handleSubmit = async (
    transaction: TransactionApiIn,
    accountId: number
  ) => {
    try {
      const [movement] = await createMovement({
        accountId: accountId,
        bodyCreateManyApiUsersMeAccountsAccountIdMovementsPost: {
          transactions: [transaction],
          transaction_ids: [],
        },
      }).unwrap();
      props.onCreated(movement);
    } catch (error) {
      logMutationError(error, createMovementResult);
      throw error;
    }
  };

  return (
    <TransactionForm
      title="Create a Transaction"
      open={props.open}
      onClose={props.onClose}
      onSubmit={handleSubmit}
      submitResult={createMovementResult}
    />
  );
}

function FormAdd(props: {
  open: boolean;
  movementId: number;
  onClose: () => void;
  onAdded?: (x: TransactionApiOut) => void;
}) {
  const [createTransaction, createTransactionResult] =
    api.endpoints.createApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsPost.useMutation();

  const handleSubmit = async (
    transactionIn: TransactionApiIn,
    accountId: number
  ) => {
    try {
      const transactionOut = await createTransaction({
        accountId: accountId,
        movementId: props.movementId,
        transactionApiIn: transactionIn,
      }).unwrap();
      props.onAdded && props.onAdded(transactionOut);
    } catch (error) {
      logMutationError(error, createTransactionResult);
      throw error;
    }
  };

  return (
    <TransactionForm
      title="Add a Transaction to Movement"
      open={props.open}
      onClose={props.onClose}
      movementId={props.movementId}
      onSubmit={handleSubmit}
      submitResult={createTransactionResult}
    />
  );
}

function FormEdit(props: {
  open: boolean;
  onClose: () => void;
  transaction: TransactionApiOut;
  movementId: number;
  relatedTransactions?: TransactionApiOut[];
  onEdited?: () => void;
}) {
  const [updateTransaction, updateTransactionResult] =
    api.endpoints.updateApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdPut.useMutation();

  const [deleteTransaction, deleteTransactionResult] =
    api.endpoints.deleteApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdDelete.useMutation();

  const uploadTransactionFile = useUploadTransactionFile(props.transaction);

  async function handleSubmit(
    transactionIn: TransactionApiIn,
    accountId: number
  ) {
    try {
      await updateTransaction({
        accountId: accountId,
        movementId: props.transaction.movement_id,
        transactionId: props.transaction.id,
        transactionApiIn: transactionIn,
        newMovementId: props.transaction.movement_id,
      }).unwrap();
      props.onEdited && props.onEdited();
    } catch (error) {
      logMutationError(error, updateTransactionResult);
      throw error;
    }
  }

  async function handleDelete() {
    try {
      await deleteTransaction({
        accountId: props.transaction.account_id,
        movementId: props.transaction.movement_id,
        transactionId: props.transaction.id,
      });
    } catch (error) {
      logMutationError(error, deleteTransactionResult);
      throw error;
    }
  }

  return (
    <TransactionForm
      title="Edit a Transaction"
      open={props.open}
      onClose={props.onClose}
      movementId={props.movementId}
      transaction={props.transaction}
      onSubmit={handleSubmit}
      submitResult={updateTransactionResult}
      onDelete={handleDelete}
      deleteResult={deleteTransactionResult}
      onUpload={async (f) => {
        await uploadTransactionFile.onUpload(f);
        props.onEdited && props.onEdited();
      }}
      uploadResult={uploadTransactionFile.result}
    />
  );
}

TransactionForm.Create = FormCreate;
TransactionForm.Add = FormAdd;
TransactionForm.Edit = FormEdit;
