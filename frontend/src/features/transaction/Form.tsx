import { Message } from "semantic-ui-react";
import { useEffect } from "react";
import {
  TransactionApiOut,
  TransactionApiIn,
  UserInstitutionLinkApiOut,
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
import { useInstitutionLinkOptions } from "features/institutionlink/hooks";
import { useAccountOptions } from "features/account/hooks";

export default function TransactionForm(props: {
  transaction?: TransactionApiOut;
  open: boolean;
  onClose: () => void;
}) {
  const amountStr = useFormField("");
  const datetime = useFormField(new Date());
  const name = useFormField("");
  const currency = useFormField("");
  // const category = useFormField("");
  const institutionLinkId = useFormField(0);
  const accountId = useFormField(0);
  const currencyCode = useFormField("");
  const code = useFormField("");
  const paymentChannel = useFormField("");

  const fields = [
    amountStr,
    datetime,
    name,
    currency,
    institutionLinkId,
    accountId,
    currencyCode,
    code,
    paymentChannel,
  ];

  // in case of modification, we'll query the selected account directly
  const accountQuery = api.endpoints.readApiAccountsIdGet.useQuery(
    accountId.value || skipToken
  );

  const paymentChannelOptions = ["online", "in store", "other"].map(
    (option, index) => ({
      key: index,
      value: option,
      text: option,
    })
  );

  const codeOptions = [
    "adjustment",
    "atm",
    "bank charge",
    "bill payment",
    "cash",
    "cashback",
    "cheque",
    "direct debit",
    "interest",
    "purchase",
    "standing order",
    "transfer",
    "null",
  ].map((option, index) => ({
    key: index,
    value: option,
    text: option,
  }));

  const institutionLinkOptions = useInstitutionLinkOptions();
  const accountOptions = useAccountOptions(institutionLinkId.value);

  useEffect(() => {
    if (!props.transaction) return;
    amountStr.set(props.transaction.amount.toFixed(2));
    datetime.set(
      props.transaction.datetime
        ? new Date(props.transaction.datetime)
        : new Date()
    );
    name.set(props.transaction.name);
    currency.set(props.transaction.currency_code);
    // category.set(props.transaction.category);
    accountId.set(props.transaction.account_id);
    currencyCode.set(props.transaction!.currency_code);
    if (accountQuery.data)
      institutionLinkId.set(accountQuery.data.user_institution_link_id);
  }, [props.transaction, accountQuery]);

  useEffect(() => {
    if (accountOptions.data?.length === 1)
      accountId.set(accountOptions.data[0].key);
  }, [accountOptions.data]);

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
      // // category: category.value!,
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
        label="Institution"
        field={institutionLinkId}
        options={institutionLinkOptions.data || []}
        loading={institutionLinkOptions.isLoading}
        error={institutionLinkOptions.isError}
      />
      <FormDropdownInput
        label="Account"
        field={accountId}
        options={accountOptions.data || []}
        loading={accountOptions.isLoading}
        error={accountOptions.isError}
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
      <FormTextInput label="Description" field={name} />
      {/* <FormTextInput label="Category" field={category} /> */}
      <FormDateTimeInput label="Time" field={datetime} />
      {fields.some((field) => field.isError) && (
        <Message
          error
          header="Action Forbidden"
          content="All fields are required!"
        />
      )}
      {(createTransactionResult.isError || updateTransactionResult.isError) && (
        <Message negative>
          <Message.Header>There's been an error</Message.Header>
          <p>
            {createTransactionResult.error &&
              renderErrorMessage(createTransactionResult.error)}
          </p>
          <p>
            {updateTransactionResult.error &&
              renderErrorMessage(updateTransactionResult.error)}
          </p>
        </Message>
      )}
    </FormModal>
  );
}
