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
import CurrencyExchangeTip from "./CurrencyExchangeTip";

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

  const amountStr = useFormField("");
  const timestamp = useFormField(new Date());
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
    timestamp,
    name,
    accountId,
    currencyCode,
    code,
    paymentChannel,
    relatedTransactionId,
  ];

  const accountQuery = api.endpoints.readApiAccountsIdGet.useQuery(
    accountId.value || skipToken
  );

  const relatedTransactionQuery =
    api.endpoints.readApiTransactionsIdGet.useQuery(
      relatedTransactionId.value || skipToken
    );

  const accountOptions = useAccountOptions();
  const searchedRelatedTransactionOptions = useTransactionOptions(search);

  useEffect(() => {
    const isEdit = props.transaction !== undefined;
    const isCreateRelated = props.relatedTransactionId !== 0;
    const rtx = relatedTransactionQuery.data;
    if (!rtx) return;
    if (!isEdit) {
      timestamp.set(rtx.timestamp ? new Date(rtx.timestamp) : new Date());
      name.set(rtx.name);
      code.set(rtx.code);
      paymentChannel.set(rtx.payment_channel);
    }
    if (isEdit || isCreateRelated) {
      setTransactionOptions([{ key: rtx.id, value: rtx.id, text: rtx.name }]);
    }
  }, [relatedTransactionQuery.data]);

  useEffect(() => {
    if (!accountQuery.isSuccess) return;
    currencyCode.set(accountQuery.data.currency_code);
  }, [accountQuery]);

  useEffect(() => {
    const tx = props.transaction;
    if (!tx) return;
    paymentChannel.set(tx.payment_channel);
    code.set(tx.code);
    relatedTransactionId.set(tx.related_transaction_id || 0);
    amountStr.set(tx.amount.toFixed(2));
    timestamp.set(tx.timestamp ? new Date(tx.timestamp) : new Date());
    name.set(tx.name);
    accountId.set(tx.account_id);
    currencyCode.set(tx.currency_code);
  }, [props.transaction]);

  useEffect(() => {
    if (!props.accountId) return;
    accountId.set(props.accountId);
  }, [props.accountId]);

  useEffect(() => {
    if (!props.relatedTransactionId) return;
    relatedTransactionId.set(props.relatedTransactionId);
  }, [props.relatedTransactionId]);

  const [createTransaction, createTransactionResult] =
    api.endpoints.createApiTransactionsPost.useMutation();
  const [updateTransaction, updateTransactionResult] =
    api.endpoints.updateApiTransactionsIdPut.useMutation();

  const handleClose = () => {
    fields.forEach((field) => field.reset());
    setSearch("");
    setTransactionOptions([]);
    props.onClose();
  };

  const handleSubmit = async () => {
    const invalidFields = fields.filter((field) => !field.validate());
    if (invalidFields.length > 0) return;

    const transaction: TransactionApiIn = {
      code: code.value! as TransactionCode,
      payment_channel: paymentChannel.value! as PaymentChannel,
      amount: Number(amountStr.value!),
      timestamp: timestamp.value!.toISOString(),
      name: name.value!,
      currency_code: currencyCode.value!,
      account_id: accountId.value!,
      related_transaction_id: relatedTransactionId.value || undefined,
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
        label="Account"
        field={accountId}
        options={accountOptions.data || []}
        query={accountOptions}
      />
      <FormDropdownInput
        disabled={isCreateRelated}
        label="Related transaction"
        optional
        field={relatedTransactionId}
        options={[
          ...relatedTransactionOption,
          ...searchedRelatedTransactionOptions.data,
        ]}
        query={searchedRelatedTransactionOptions}
        onSearchChange={setSearch}
      />
      <FormCurrencyInput
        label="Amount"
        query={accountQuery}
        amount={amountStr}
        currency={currencyCode.value || "USD"}
      />
      {relatedTransactionQuery.isSuccess &&
        currencyCode.value &&
        currencyCode.value !== relatedTransactionQuery.data.currency_code && (
          <CurrencyExchangeTip
            relatedTransaction={relatedTransactionQuery.data}
            currencyCode={currencyCode.value}
          />
        )}

      <FormDropdownInput label="Code" field={code} options={codeOptions} />
      <FormDropdownInput
        label="Payment Channel"
        field={paymentChannel}
        options={paymentChannelOptions}
      />
      <FormTextInput label="Name" field={name} />
      <FormDateTimeInput
        disabled={isCreateRelated}
        label="Time"
        field={timestamp}
      />
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
