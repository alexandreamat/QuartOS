import { Message } from "semantic-ui-react";
import { useEffect } from "react";
import {
  AccountApiOut,
  AccountApiIn,
  AccountType,
  api,
} from "app/services/api";
import { renderErrorMessage } from "utils/error";
import FormModal from "components/FormModal";
import useFormField from "hooks/useFormField";
import FormTextInput from "components/FormTextInput";
import FormCurrencyInput from "components/FormCurrencyInput";
import FormDropdownInput from "components/FormDropdownInput";
import { useLocation } from "react-router-dom";
import InstitutionLinkOption from "features/institutionlink/InstitutionLinkOption";

export default function AccountForm(props: {
  account?: AccountApiOut;
  open: boolean;
  onClose: () => void;
}) {
  const mask = useFormField("");
  const name = useFormField("");
  const currencyCode = useFormField("");
  const typeIdx = useFormField(-1);
  const institutionLinkId = useFormField(0);
  const balanceStr = useFormField("");

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const institutionLinkIdParam = params.get("institutionLinkId");

  useEffect(() => {
    institutionLinkId.set(Number(institutionLinkIdParam));
  }, [institutionLinkIdParam]);

  const fields = [
    mask,
    name,
    currencyCode,
    typeIdx,
    balanceStr,
    institutionLinkId,
  ];

  const [createAccount, createAccountResult] =
    api.endpoints.createApiAccountsPost.useMutation();
  const [updateAccount, updateAccountResult] =
    api.endpoints.updateApiAccountsIdPut.useMutation();

  useEffect(() => {
    if (!props.account) return;
    name.set(props.account.name);
    currencyCode.set(props.account.currency_code);
    typeIdx.set(
      typeOptions.findIndex((option) => option.text === props.account?.type)
    );
    institutionLinkId.set(props.account.user_institution_link_id);
    balanceStr.set(props.account.balance.toFixed(2));
  }, [props.account]);

  const institutionLinksQuery =
    api.endpoints.readManyApiInstitutionLinksGet.useQuery();

  const institutionLinkOptions =
    institutionLinksQuery.data?.map((link) => {
      const content = <InstitutionLinkOption link={link} />;
      return {
        key: link.id,
        value: link.id,
        content: content,
        text: content,
      };
    }) || [];

  const handleClose = () => {
    fields.forEach((field) => field.reset());
    props.onClose();
  };

  const typeOptions = [
    "investment",
    "credit",
    "depository",
    "loan",
    "brokerage",
    "other",
  ].map((type, index) => ({
    key: index,
    value: index,
    text: type,
  }));

  const handleSubmit = async () => {
    const invalidFields = fields.filter((field) => !field.validate());

    if (invalidFields.length > 0) return;

    const account: AccountApiIn = {
      mask: mask.value!,
      name: name.value!,
      currency_code: currencyCode.value!,
      type: typeOptions[typeIdx.value!].text as AccountType,
      user_institution_link_id: institutionLinkId.value!,
      balance: Number(balanceStr.value!),
    };
    if (props.account) {
      try {
        await updateAccount({
          id: props.account.id,
          accountApiIn: account,
        }).unwrap();
      } catch (error) {
        console.error(error);
        console.error(updateAccountResult.originalArgs);
        return;
      }
    } else {
      try {
        await createAccount(account).unwrap();
      } catch (error) {
        console.error(error);
        console.error(createAccountResult.originalArgs);
        return;
      }
    }
    handleClose();
  };

  return (
    <FormModal
      open={props.open}
      onClose={handleClose}
      title={(props.account ? "Edit" : "Add") + " an Account"}
      onSubmit={handleSubmit}
    >
      <FormDropdownInput
        label="Institution"
        field={institutionLinkId}
        options={institutionLinkOptions}
        loading={institutionLinksQuery.isLoading}
        error={institutionLinksQuery.isError}
      />
      <FormTextInput label="Account Name" field={name} />
      <FormTextInput label="Account Number" field={mask} />
      <FormCurrencyInput
        label="Current Balance"
        amount={balanceStr}
        currency={currencyCode}
      />
      <FormDropdownInput label="Type" field={typeIdx} options={typeOptions} />
      {fields.some((field) => field.isError) && (
        <Message
          error
          header="Action Forbidden"
          content="All fields are required!"
        />
      )}
      {(createAccountResult.isError || updateAccountResult.isError) && (
        <Message negative>
          <Message.Header> There's been an error</Message.Header>
          <p>
            {createAccountResult.error &&
              renderErrorMessage(createAccountResult.error)}
          </p>
          <p>
            {updateAccountResult.error &&
              renderErrorMessage(updateAccountResult.error)}
          </p>
        </Message>
      )}
    </FormModal>
  );
}
