import { DropdownItemProps } from "semantic-ui-react";
import { useEffect, useState } from "react";
import { TransactionApiOut, api } from "app/services/api";
import FormModal from "components/FormModal";
import useFormField from "hooks/useFormField";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import FormDateTimeInput from "components/FormDateTimeInput";
import FormTextInput from "components/FormTextInput";
import FormCurrencyInput from "components/FormCurrencyInput";
import FormDropdownInput from "components/FormDropdownInput";
import { useAccountOptions } from "features/account/hooks";
import { useTransactionOptions } from "./hooks";
import { codeOptions, paymentChannelOptions } from "./options";
import CurrencyExchangeTip from "./CurrencyExchangeTip";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { FormValidationError } from "../../components/FormValidationError";
import { TransactionApiInForm } from "./types";
import { transactionApiOutToForm, transactionFormToApiIn } from "./utils";
import { logMutationError } from "utils/error";

export default function TransactionForm(props: {
  transaction?: TransactionApiOut;
  accountId?: number;
  relatedTransactionId?: number;
  open: boolean;
  onClose: () => void;
  onMutation: () => void;
}) {
  const isEdit = props.transaction !== undefined;
  const isCreateRelated = props.relatedTransactionId !== 0;

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

  const accountOptions = useAccountOptions();
  const searchedRelatedTransactionOptions = useTransactionOptions(search);

  useEffect(() => {
    const isEdit = props.transaction !== undefined;
    const isCreateRelated = props.relatedTransactionId !== 0;
    const rtx = relatedTransactionQuery.data;
    if (!rtx) return;
    if (!isEdit) {
      form.timestamp.set(rtx.timestamp ? new Date(rtx.timestamp) : new Date());
      form.name.set(rtx.name);
      form.code.set(rtx.code);
      form.paymentChannel.set(rtx.payment_channel);
    }
    if (isEdit || isCreateRelated) {
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

  useEffect(() => {
    props.relatedTransactionId &&
      form.relatedTransactionId.set(props.relatedTransactionId);
  }, [props.relatedTransactionId]);

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

  function getModalTitle(isEdit: boolean, isCreateRelated: boolean) {
    if (isEdit) {
      return "Edit a Transaction";
    } else if (isCreateRelated) {
      return "Add a Related Transaction";
    } else {
      return "Add a Transaction";
    }
  }

  return (
    <FormModal
      open={props.open}
      onClose={handleClose}
      title={getModalTitle(isEdit, isCreateRelated)}
      onSubmit={handleSubmit}
    >
      <FormDropdownInput
        field={form.accountId}
        options={accountOptions.data || []}
        query={accountOptions}
      />
      <FormDropdownInput
        disabled={isCreateRelated}
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
      />
      {relatedTransactionQuery.isSuccess && form.currencyCode.value && (
        <CurrencyExchangeTip
          relatedTransaction={relatedTransactionQuery.data}
          currencyCode={form.currencyCode.value}
        />
      )}

      <FormDropdownInput field={form.code} options={codeOptions} />
      <FormDropdownInput
        field={form.paymentChannel}
        options={paymentChannelOptions}
      />
      <FormTextInput field={form.name} />
      <FormDateTimeInput disabled={isCreateRelated} field={form.timestamp} />
      <FormValidationError fields={Object.values(form)} />
      <QueryErrorMessage query={createTransactionResult} />
      <QueryErrorMessage query={updateTransactionResult} />
    </FormModal>
  );
}
