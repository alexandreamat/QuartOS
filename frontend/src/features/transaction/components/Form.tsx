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
import { Icon, Message, Modal, Form, Button } from "semantic-ui-react";
import { logMutationError } from "utils/error";
import { TransactionApiInForm } from "../types";
import { transactionApiOutToForm, transactionFormToApiIn } from "../utils";
import CurrencyExchangeTips from "./CurrencyExchangeTips";
import { SimpleQuery } from "interfaces";
import ConfirmDeleteButtonModal from "components/ConfirmDeleteButtonModal";

export default function TransactionForm(props: {
  title: string;
  open: boolean;
  onClose: () => void;
  accountId?: number;
  movementId?: number;
  transaction?: TransactionApiOut;
  onSubmit: (x: TransactionApiIn, y: number) => Promise<void>;
  resultQuery: SimpleQuery;
  onDelete?: () => Promise<void>;
  deleteQuery?: SimpleQuery;
}) {
  const isEdit = props.transaction !== undefined;

  const form: TransactionApiInForm = {
    amountStr: useFormField("", "amount"),
    timestamp: useFormField(new Date(), "date"),
    name: useFormField("", "name"),
    currencyCode: useFormField("", "currency"),
    accountId: useFormField(0, "account"),
  };

  const accountQuery =
    api.endpoints.readApiUsersMeAccountsAccountIdGet.useQuery(
      form.accountId.value || skipToken
    );

  const movementQuery =
    api.endpoints.readApiUsersMeMovementsMovementIdGet.useQuery(
      props.movementId || skipToken
    );

  const disableSynced = isEdit && accountQuery.data?.is_synced;

  const accountOptions = useAccountOptions();

  useEffect(() => {
    if (props.transaction !== undefined) return;
    if (!movementQuery.isSuccess) return;
    const movement = movementQuery.data;
    const timestamp = movement.earliest_timestamp;
    form.timestamp.set(timestamp ? new Date(timestamp) : new Date());
    form.name.set(movement.name);
  }, [movementQuery.isSuccess, movementQuery.data, props.open]);

  useEffect(() => {
    accountQuery.isSuccess &&
      form.currencyCode.set(accountQuery.data.currency_code);
  }, [accountQuery.isSuccess, accountQuery.data, props.open]);

  useEffect(() => {
    props.transaction && transactionApiOutToForm(props.transaction, form);
  }, [props.transaction, props.open]);

  useEffect(() => {
    props.accountId && form.accountId.set(props.accountId);
  }, [props.accountId, props.open]);

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
    if (!props.onDelete) return;
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
            currency={form.currencyCode.value || "USD"}
            readOnly={disableSynced}
          />
          {movementQuery.isSuccess && form.currencyCode.value && (
            <CurrencyExchangeTips
              relatedTransactions={movementQuery.data.transactions}
              currencyCode={form.currencyCode.value}
            />
          )}
          <FormTextInput field={form.name} readOnly={disableSynced} />
          <FormDateTimeInput field={form.timestamp} readOnly={disableSynced} />
          <FormValidationError fields={Object.values(form)} />
          <QueryErrorMessage query={props.resultQuery} />
          {disableSynced && (
            <Message info icon>
              <Icon name="info circle" />
              <Message.Content>
                This transaction is synchronised with your institution, and is
                not fully editable.
              </Message.Content>
            </Message>
          )}
        </Form>
      </Modal.Content>
      <Modal.Actions>
        {props.onDelete && props.deleteQuery && (
          <ConfirmDeleteButtonModal
            onDelete={handleDelete}
            query={props.deleteQuery}
          />
        )}
        <Button onClick={handleClose}>Cancel</Button>
        <Button
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
  accountId?: number;
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
      accountId={props.accountId}
      onSubmit={handleSubmit}
      resultQuery={createMovementResult}
    />
  );
}

function FormAdd(props: {
  accountId?: number;
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
      accountId={props.accountId}
      movementId={props.movementId}
      onSubmit={handleSubmit}
      resultQuery={createTransactionResult}
    />
  );
}

function FormEdit(props: {
  transaction: TransactionApiOut;
  accountId?: number;
  relatedTransactions?: TransactionApiOut[];
  open: boolean;
  onClose: () => void;
  onEdited?: (x: TransactionApiOut) => void;
  movementId: number;
}) {
  const [updateTransaction, updateTransactionResult] =
    api.endpoints.updateApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdPut.useMutation();

  const [deleteTransaction, deleteTransactionResult] =
    api.endpoints.deleteApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdDelete.useMutation();

  const handleSubmit = async (
    transactionIn: TransactionApiIn,
    accountId: number
  ) => {
    try {
      const transactionOut = await updateTransaction({
        accountId: accountId,
        movementId: props.transaction.movement_id,
        transactionId: props.transaction.id,
        transactionApiIn: transactionIn,
        newMovementId: props.transaction.movement_id,
      }).unwrap();
      props.onEdited && props.onEdited(transactionOut);
    } catch (error) {
      logMutationError(error, updateTransactionResult);
      throw error;
    }
  };

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
      accountId={props.accountId}
      movementId={props.movementId}
      transaction={props.transaction}
      onSubmit={handleSubmit}
      resultQuery={updateTransactionResult}
      onDelete={handleDelete}
      deleteQuery={deleteTransactionResult}
    />
  );
}

TransactionForm.Create = FormCreate;
TransactionForm.Add = FormAdd;
TransactionForm.Edit = FormEdit;
