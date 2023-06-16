import { skipToken } from "@reduxjs/toolkit/dist/query";
import { TransactionApiOut, api } from "app/services/api";
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

export default function Form(props: {
  transaction?: TransactionApiOut;
  accountId?: number;
  relatedTransactions?: TransactionApiOut[];
  open: boolean;
  onClose: () => void;
  onMutation: (x: TransactionApiOut) => void;
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

  const disableSynced = isEdit && accountQuery.data?.is_synced;

  const accountOptions = useAccountOptions();

  useEffect(() => {
    const isEdit = props.transaction !== undefined;
    const txs = props.relatedTransactions;
    if (!txs) return;
    if (!isEdit) {
      const timestamp = txs.reduce(
        (acc, tx) => (tx.timestamp && acc > tx.timestamp ? tx.timestamp : acc),
        new Date().toISOString()
      );
      form.timestamp.set(timestamp ? new Date(timestamp) : new Date());
      form.name.set(txs.find((tx) => tx.name)?.name || "");
      form.code.set(
        txs.find((tx) => tx.payment_channel)?.payment_channel || "null"
      );
      form.paymentChannel.set(txs.find((tx) => tx.code)?.code || "other");
    }
  }, [props.relatedTransactions]);

  useEffect(() => {
    accountQuery.isSuccess &&
      form.currencyCode.set(accountQuery.data.currency_code);
  }, [accountQuery]);

  useEffect(() => {
    props.transaction && transactionApiOutToForm(props.transaction, form);
  }, [props.transaction]);

  useEffect(() => {
    props.accountId && form.accountId.set(props.accountId);
  }, [props.accountId]);

  const [createTransaction, createTransactionResult] =
    api.endpoints.createApiTransactionsPost.useMutation();
  const [updateTransaction, updateTransactionResult] =
    api.endpoints.updateApiTransactionsIdPut.useMutation();

  const handleClose = () => {
    Object.values(form).forEach((field) => field.reset());
    props.onClose();
  };

  const handleSubmit = async () => {
    const invalidFields = Object.values(form).filter(
      (field) => !field.validate()
    );
    if (invalidFields.length > 0) return;
    const transactionIn = transactionFormToApiIn(form);
    if (props.transaction) {
      try {
        const transactionOut = await updateTransaction({
          id: props.transaction.id,
          transactionApiIn: transactionIn,
        }).unwrap();
        props.onMutation(transactionOut);
      } catch (error) {
        logMutationError(error, updateTransactionResult);
        return;
      }
    } else {
      try {
        const transactionsOut = await createTransaction([
          transactionIn,
        ]).unwrap();
        props.onMutation(transactionsOut[0]);
      } catch (error) {
        logMutationError(error, createTransactionResult);
        return;
      }
    }
    handleClose();
  };

  function getModalTitle(isEdit: boolean) {
    if (isEdit) {
      return "Edit a Transaction";
    } else {
      return "Add a Transaction";
    }
  }

  return (
    <FormModal
      open={props.open}
      onClose={handleClose}
      title={getModalTitle(isEdit)}
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
      {props.relatedTransactions && form.currencyCode.value && (
        <CurrencyExchangeTips
          relatedTransactions={props.relatedTransactions}
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
      <QueryErrorMessage query={createTransactionResult} />
      <QueryErrorMessage query={updateTransactionResult} />
      {disableSynced && (
        <Message info icon>
          <Icon name="info circle" />
          <Message.Content>
            This transaction is synchronised with your institution. Synchronised
            transactions are not fully editable.
          </Message.Content>
        </Message>
      )}
    </FormModal>
  );
}
