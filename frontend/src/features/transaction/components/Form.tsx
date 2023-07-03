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
import FormModal from "components/FormModal";
import FormTextInput from "components/FormTextInput";
import { FormValidationError } from "components/FormValidationError";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { useAccountOptions } from "features/account/hooks";
import useFormField from "hooks/useFormField";
import { useEffect } from "react";
import { Icon, Message } from "semantic-ui-react";
import { logMutationError } from "utils/error";
import { codeOptions, paymentChannelOptions } from "../options";
import { TransactionApiInForm } from "../types";
import { transactionApiOutToForm, transactionFormToApiIn } from "../utils";
import CurrencyExchangeTips from "./CurrencyExchangeTips";
import { SimpleQuery } from "interfaces";

export default function Form(props: {
  title: string;
  open: boolean;
  onClose: () => void;
  accountId?: number;
  movementId?: number;
  transaction?: TransactionApiOut;
  onSubmit: (x: TransactionApiIn) => Promise<void>;
  resultQuery: SimpleQuery;
}) {
  const isEdit = props.transaction !== undefined;

  const form: TransactionApiInForm = {
    amountStr: useFormField("", "amount"),
    timestamp: useFormField(new Date(), "date"),
    name: useFormField("", "name"),
    currencyCode: useFormField("", "currency"),
    accountId: useFormField(0, "account"),
    paymentChannel: useFormField("", "payment channel"),
    code: useFormField("", "code"),
  };

  const accountQuery = api.endpoints.readApiAccountsIdGet.useQuery(
    form.accountId.value || skipToken
  );

  const movementQuery = api.endpoints.readApiMovementsIdGet.useQuery(
    props.movementId || skipToken
  );

  const relatedTransactionsQuery =
    api.endpoints.readTransactionsApiMovementsIdTransactionsGet.useQuery(
      props.movementId || skipToken
    );

  const disableSynced = isEdit && accountQuery.data?.is_synced;

  const accountOptions = useAccountOptions();

  useEffect(() => {
    if (props.transaction !== undefined) return;
    if (!movementQuery.isSuccess) return;
    const movement = movementQuery.data;
    const timestamp = movement.latest_timestamp;
    form.timestamp.set(timestamp ? new Date(timestamp) : new Date());
    form.code.set("transfer");
    form.paymentChannel.set("other");
  }, [movementQuery.isSuccess, movementQuery.data]);

  useEffect(() => {
    accountQuery.isSuccess &&
      form.currencyCode.set(accountQuery.data.currency_code);
  }, [accountQuery.isSuccess, accountQuery.data]);

  useEffect(() => {
    props.transaction && transactionApiOutToForm(props.transaction, form);
  }, [props.transaction]);

  useEffect(() => {
    props.accountId && form.accountId.set(props.accountId);
  }, [props.accountId]);

  const handleSubmit = async () => {
    const invalidFields = Object.values(form).filter(
      (field) => !field.validate()
    );
    if (invalidFields.length > 0) return;
    const transactionIn = transactionFormToApiIn(form);
    try {
      await props.onSubmit(transactionIn);
    } catch (error) {
      return;
    }
    handleClose();
  };

  const handleClose = () => {
    Object.values(form).forEach((field) => field.reset());
    props.onClose();
  };

  return (
    <FormModal
      open={props.open}
      onClose={handleClose}
      title={props.title}
      onSubmit={handleSubmit}
    >
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
      {relatedTransactionsQuery.isSuccess && form.currencyCode.value && (
        <CurrencyExchangeTips
          relatedTransactions={relatedTransactionsQuery.data}
          currencyCode={form.currencyCode.value}
        />
      )}
      <FormDropdownInput
        field={form.code}
        options={codeOptions}
        // readOnly={disableSynced}
      />
      <FormDropdownInput
        field={form.paymentChannel}
        options={paymentChannelOptions}
        readOnly={disableSynced}
      />
      <FormTextInput field={form.name} readOnly={disableSynced} />
      <FormDateTimeInput field={form.timestamp} readOnly={disableSynced} />
      <FormValidationError fields={Object.values(form)} />
      <QueryErrorMessage query={props.resultQuery} />
      {disableSynced && (
        <Message info icon>
          <Icon name="info circle" />
          <Message.Content>
            This transaction is synchronised with your institution, and is not
            fully editable.
          </Message.Content>
        </Message>
      )}
    </FormModal>
  );
}

function FromCreate(props: {
  accountId?: number;
  open: boolean;
  onClose: () => void;
  onCreated: (x: MovementApiOut) => void;
}) {
  const [createMovement, createMovementResult] =
    api.endpoints.createApiMovementsPost.useMutation();

  const handleSubmit = async (transaction: TransactionApiIn) => {
    try {
      const [movement] = await createMovement({
        transactions: [transaction],
        transaction_ids: [],
      }).unwrap();
      props.onCreated(movement);
    } catch (error) {
      logMutationError(error, createMovementResult);
      return;
    }
  };

  return (
    <Form
      title="Create a Transaction"
      open={props.open}
      onClose={props.onClose}
      accountId={props.accountId}
      onSubmit={handleSubmit}
      resultQuery={createMovementResult}
    />
  );
}

function FromAdd(props: {
  accountId?: number;
  open: boolean;
  movementId: number;
  onClose: () => void;
  onAdded: (x: MovementApiOut) => void;
}) {
  const [addTransaction, addTransactionResult] =
    api.endpoints.addTransactionApiMovementsIdTransactionsPost.useMutation();

  const handleSubmit = async (transaction: TransactionApiIn) => {
    try {
      const movement = await addTransaction({
        id: props.movementId,
        transactionApiIn: transaction,
      }).unwrap();
      props.onAdded(movement);
    } catch (error) {
      logMutationError(error, addTransactionResult);
      return;
    }
  };

  return (
    <Form
      title="Add a Transaction to Movement"
      open={props.open}
      onClose={props.onClose}
      accountId={props.accountId}
      movementId={props.movementId}
      onSubmit={handleSubmit}
      resultQuery={addTransactionResult}
    />
  );
}

function FromEdit(props: {
  transaction: TransactionApiOut;
  accountId?: number;
  relatedTransactions?: TransactionApiOut[];
  open: boolean;
  onClose: () => void;
  onEdit: (x: TransactionApiOut) => void;
  movementId: number;
}) {
  const [updateTransaction, updateTransactionResult] =
    api.endpoints.updateTransactionApiMovementsIdTransactionsTransactionIdPut.useMutation();

  const handleSubmit = async (transactionIn: TransactionApiIn) => {
    try {
      const movementId = props.transaction.movement_id;
      const transactionOut = await updateTransaction({
        id: movementId,
        transactionId: props.transaction.id,
        transactionApiIn: { ...transactionIn, movement_id: movementId },
      }).unwrap();
      props.onEdit(transactionOut);
    } catch (error) {
      logMutationError(error, updateTransactionResult);
      throw error;
    }
  };

  return (
    <Form
      title="Edit a Transaction"
      open={props.open}
      onClose={props.onClose}
      accountId={props.accountId}
      movementId={props.movementId}
      transaction={props.transaction}
      onSubmit={handleSubmit}
      resultQuery={updateTransactionResult}
    />
  );
}

Form.Create = FromCreate;
Form.Add = FromAdd;
Form.Edit = FromEdit;
