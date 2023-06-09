import { DropdownItemProps, Message } from "semantic-ui-react";
import { useEffect, useState } from "react";
import {
  TransactionApiOut,
  TransactionApiIn,
  api,
  PaymentChannel,
  TransactionCode,
} from "app/services/api";
import { renderErrorMessage } from "utils/error";
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

export default function TransactionForm(props: {
  transaction?: TransactionApiOut;
  open: boolean;
  onClose: () => void;
}) {
  const amountStr = useFormField("");
  const datetime = useFormField(new Date());
  const name = useFormField("");
  const accountId = useFormField(0);
  const currencyCode = useFormField("");
  const code = useFormField("");
  const paymentChannel = useFormField("");
  const relatedTransactionId = useFormField(0, true);

  const [search, setSearch] = useState("");
  const [relatedTransactionOption, setTransactionOptions] = useState<
    DropdownItemProps[]
  >([]);

  const fields = [
    amountStr,
    datetime,
    name,
    accountId,
    currencyCode,
    code,
    paymentChannel,
    relatedTransactionId,
  ];

  const relatedTransactionQuery =
    api.endpoints.readApiTransactionsIdGet.useQuery(
      relatedTransactionId.value || skipToken
    );

  const accountOptions = useAccountOptions();
  const searchedRelatedTransactionOptions = useTransactionOptions(search);

  useEffect(() => {
    const rtx = relatedTransactionQuery.data;
    if (!rtx) return;
    if (props.transaction) {
      setTransactionOptions([{ key: rtx.id, value: rtx.id, text: rtx.name }]);
    } else {
      amountStr.set((-rtx.amount).toFixed(2));
      datetime.set(rtx.datetime ? new Date(rtx.datetime) : new Date());
      name.set(rtx.name);
      currencyCode.set(rtx.currency_code);
      code.set(rtx.code);
      paymentChannel.set(rtx.payment_channel);
    }
  }, [relatedTransactionQuery.data]);

  useEffect(() => {
    const tx = props.transaction;
    if (!tx) return;
    paymentChannel.set(tx.payment_channel);
    code.set(tx.code);
    relatedTransactionId.set(tx.related_transaction_id || 0);
    amountStr.set(tx.amount.toFixed(2));
    datetime.set(tx.datetime ? new Date(tx.datetime) : new Date());
    name.set(tx.name);
    accountId.set(tx.account_id);
    currencyCode.set(tx.currency_code);
  }, [props.transaction]);

  const [createTransaction, createTransactionResult] =
    api.endpoints.createApiTransactionsPost.useMutation();
  const [updateTransaction, updateTransactionResult] =
    api.endpoints.updateApiTransactionsIdPut.useMutation();

  const handleClose = () => {
    fields.forEach((field) => field.reset());
    props.onClose();
  };

  const handleSubmit = async () => {
    const invalidFields = fields.filter((field) => !field.validate());
    if (invalidFields.length > 0) return;

    const transaction: TransactionApiIn = {
      code: code.value! as TransactionCode,
      payment_channel: paymentChannel.value! as PaymentChannel,
      amount: Number(amountStr.value!),
      datetime: datetime.value!.toISOString(),
      name: name.value!,
      currency_code: currencyCode.value!,
      account_id: accountId.value!,
    };
    if (props.transaction) {
      try {
        await updateTransaction({
          id: props.transaction.id,
          transactionApiIn: transaction,
        }).unwrap();
      } catch (error) {
        console.error(error);
        console.error(updateTransactionResult.error);
        console.error(updateTransactionResult.originalArgs);
        return;
      }
    } else {
      try {
        await createTransaction([transaction]).unwrap();
      } catch (error) {
        console.error(error);
        console.error(createTransactionResult.error);
        console.error(createTransactionResult.originalArgs);
        return;
      }
    }
    handleClose();
  };

  return (
    <FormModal
      open={props.open}
      onClose={handleClose}
      title={(props.transaction ? "Edit" : "Add") + " a Transaction"}
      onSubmit={handleSubmit}
    >
      <FormDropdownInput
        label="Account"
        field={accountId}
        options={accountOptions.data || []}
        loading={accountOptions.isLoading}
        error={accountOptions.isError}
      />
      <FormDropdownInput
        label="Related transaction"
        optional
        field={relatedTransactionId}
        options={[
          ...relatedTransactionOption,
          ...searchedRelatedTransactionOptions.data,
        ]}
        loading={searchedRelatedTransactionOptions.isLoading}
        error={searchedRelatedTransactionOptions.isError}
        onSearchChange={setSearch}
      />
      <FormCurrencyInput
        label="Amount"
        amount={amountStr}
        currency={currencyCode}
      />
      <FormDropdownInput label="Code" field={code} options={codeOptions} />
      <FormDropdownInput
        label="Payment Channel"
        field={paymentChannel}
        options={paymentChannelOptions}
      />
      <FormTextInput label="Name" field={name} />
      <FormDateTimeInput label="Time" field={datetime} />
      {fields.some((field) => field.isError) && (
        <Message
          error
          header="Action Forbidden"
          content="All fields are required!"
        />
      )}
      {createTransactionResult.isError && (
        <Message negative>
          <Message.Header>There's been an error</Message.Header>
          {renderErrorMessage(createTransactionResult.error)}
        </Message>
      )}
      {updateTransactionResult.isError && (
        <Message negative>
          <Message.Header>There's been an error</Message.Header>
          {renderErrorMessage(updateTransactionResult.error)}
        </Message>
      )}
    </FormModal>
  );
}
