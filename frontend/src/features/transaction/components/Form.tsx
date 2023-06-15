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
import { useEffect, useState } from "react";
import { DropdownItemProps, Icon, Message } from "semantic-ui-react";
import { logMutationError } from "utils/error";
import { useTransactionOptions } from "../hooks";
import { codeOptions, paymentChannelOptions } from "../options";
import { TransactionApiInForm } from "../types";
import { transactionApiOutToForm, transactionFormToApiIn } from "../utils";
import CurrencyExchangeTip from "./CurrencyExchangeTip";

export default function TransactionForm(props: {
  transaction?: TransactionApiOut;
  accountId?: number;
  open: boolean;
  onClose: () => void;
  onMutation: () => void;
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
    relatedTransactionId: useFormField(0, "related transaction", true),
  };

  const [search, setSearch] = useState("");
  const [relatedTransactionOption, setTransactionOptions] = useState<
    DropdownItemProps[]
  >([]);

  const accountQuery = api.endpoints.readApiAccountsIdGet.useQuery(
    form.accountId.value || skipToken
  );

  const relatedTransactionQuery =
    api.endpoints.readApiTransactionsIdGet.useQuery(
      form.relatedTransactionId.value || skipToken
    );

  const disableSynced = isEdit && accountQuery.data?.is_synced;

  const accountOptions = useAccountOptions();
  const searchedRelatedTransactionOptions = useTransactionOptions(search);

  useEffect(() => {
    const isEdit = props.transaction !== undefined;
    const rtx = relatedTransactionQuery.data;
    if (!rtx) return;
    if (!isEdit) {
      form.timestamp.set(rtx.timestamp ? new Date(rtx.timestamp) : new Date());
      form.name.set(rtx.name);
      form.code.set(rtx.code);
      form.paymentChannel.set(rtx.payment_channel);
    }
    if (isEdit) {
      setTransactionOptions([{ key: rtx.id, value: rtx.id, text: rtx.name }]);
    }
  }, [relatedTransactionQuery.data]);

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
    setSearch("");
    setTransactionOptions([]);
    props.onClose();
  };

  const handleSubmit = async () => {
    const invalidFields = Object.values(form).filter(
      (field) => !field.validate()
    );
    if (invalidFields.length > 0) return;
    const transaction = transactionFormToApiIn(form);
    if (props.transaction) {
      try {
        await updateTransaction({
          id: props.transaction.id,
          transactionApiIn: transaction,
        }).unwrap();
      } catch (error) {
        logMutationError(error, updateTransactionResult);
        return;
      }
    } else {
      try {
        await createTransaction([transaction]).unwrap();
      } catch (error) {
        logMutationError(error, createTransactionResult);
        return;
      }
    }
    props.onMutation();
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
      <FormDropdownInput
        optional
        field={form.relatedTransactionId}
        options={[
          ...relatedTransactionOption,
          ...searchedRelatedTransactionOptions.data,
        ]}
        query={searchedRelatedTransactionOptions}
        onSearchChange={setSearch}
      />
      <FormCurrencyInput
        query={accountQuery}
        field={form.amountStr}
        currency={form.currencyCode.value || "USD"}
        readOnly={disableSynced}
      />
      {relatedTransactionQuery.isSuccess && form.currencyCode.value && (
        <CurrencyExchangeTip
          relatedTransaction={relatedTransactionQuery.data}
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
