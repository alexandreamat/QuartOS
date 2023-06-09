import { CheckboxProps, Form, Message } from "semantic-ui-react";
import { useEffect } from "react";
import {
  AccountApiOut,
  AccountApiIn,
  InstitutionalAccountType,
  NonInstitutionalAccountType,
  api,
} from "app/services/api";
import { renderErrorMessage } from "utils/error";
import FormModal from "components/FormModal";
import useFormField from "hooks/useFormField";
import FormTextInput from "components/FormTextInput";
import FormCurrencyInput from "components/FormCurrencyInput";
import FormDropdownInput from "components/FormDropdownInput";
import { useLocation } from "react-router-dom";
import { useInstitutionLinkOptions } from "features/institutionlink/hooks";
import { capitalizeFirstLetter as capitaliseFirstLetter } from "utils/string";

export default function AccountForm(props: {
  account?: AccountApiOut;
  open: boolean;
  onClose: () => void;
}) {
  const isInstitutional = useFormField(false);
  const mask = useFormField("");
  const name = useFormField("");
  const currencyCode = useFormField("");
  const institutionalType = useFormField("");
  const nonInstitutionalType = useFormField("");
  const institutionLinkId = useFormField(0);
  const balanceStr = useFormField("");

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const institutionLinkIdParam = params.get("institutionLinkId");

  const institutionLinkOptions = useInstitutionLinkOptions();

  useEffect(() => {
    institutionLinkId.set(Number(institutionLinkIdParam));
  }, [institutionLinkIdParam]);

  const fields = [
    mask,
    name,
    currencyCode,
    institutionalType,
    nonInstitutionalType,
    balanceStr,
    institutionLinkId,
    isInstitutional,
  ];

  const requiredFields = [name, currencyCode, balanceStr];

  const [createAccount, createAccountResult] =
    api.endpoints.createApiAccountsPost.useMutation();
  const [updateAccount, updateAccountResult] =
    api.endpoints.updateApiAccountsIdPut.useMutation();

  useEffect(() => {
    if (!props.account) return;
    name.set(props.account.name);
    currencyCode.set(props.account.currency_code);
    balanceStr.set(props.account.balance.toFixed(2));
    if (props.account.institutionalaccount) {
      const institutionalAccount = props.account.institutionalaccount;
      institutionLinkId.set(institutionalAccount.user_institution_link_id);
      institutionalType.set(institutionalAccount.type);
      mask.set(institutionalAccount.mask);
    }
    if (props.account.noninstitutionalaccount) {
      const nonInstitutionalAccount = props.account.noninstitutionalaccount;
      nonInstitutionalType.set(nonInstitutionalAccount.type);
    }
  }, [props.account]);

  const handleClose = () => {
    fields.forEach((field) => field.reset());
    props.onClose();
  };

  const institutionalTypeOptions = [
    "investment",
    "credit",
    "depository",
    "loan",
    "brokerage",
    "other",
  ].map((type, index) => ({
    key: index,
    value: index,
    text: capitaliseFirstLetter(type),
  }));

  const nonInstitutionalTypeOptions = [
    "personal ledger",
    "cash",
    "property",
  ].map((type, index) => ({
    key: index,
    value: type,
    text: capitaliseFirstLetter(type),
  }));

  const handleSubmit = async () => {
    const formFields = [
      ...requiredFields,
      ...(isInstitutional.value
        ? [institutionalType, institutionLinkId, mask]
        : [nonInstitutionalType]),
    ];

    const invalidFields = formFields.reduce(
      (count, field) => count + (field.validate() ? 0 : 1),
      0
    );

    if (invalidFields > 0) return;

    const account: AccountApiIn = {
      name: name.value!,
      currency_code: currencyCode.value!,
      balance: Number(balanceStr.value!),
      institutionalaccount: isInstitutional.value
        ? {
            mask: mask.value!,
            type: institutionalType.value! as InstitutionalAccountType,
            user_institution_link_id: institutionLinkId.value!,
          }
        : undefined,
      noninstitutionalaccount: !isInstitutional.value
        ? {
            type: nonInstitutionalType.value! as NonInstitutionalAccountType,
          }
        : undefined,
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
      <FormTextInput label="Account Name" field={name} />
      <Form.Checkbox
        label="Link to a financial institution"
        checked={isInstitutional.value}
        onChange={(
          event: React.FormEvent<HTMLInputElement>,
          data: CheckboxProps
        ) => {
          institutionalType.reset();
          nonInstitutionalType.reset();
          isInstitutional.reset();
          isInstitutional.set(data.checked);
        }}
      />
      {isInstitutional.value ? (
        <>
          <FormDropdownInput
            label="Institution"
            field={institutionLinkId}
            options={institutionLinkOptions.data || []}
            loading={institutionLinkOptions.isLoading}
            error={institutionLinkOptions.isError}
          />
          <FormDropdownInput
            label="Type"
            field={institutionalType}
            options={institutionalTypeOptions}
          />
          <FormTextInput label="Account Number" field={mask} />
        </>
      ) : (
        <>
          <FormDropdownInput
            label="Type"
            field={nonInstitutionalType}
            options={nonInstitutionalTypeOptions}
          />
        </>
      )}
      <FormCurrencyInput
        label="Current Balance"
        amount={balanceStr}
        currency={currencyCode}
      />
      {requiredFields.some((field) => field.isError) && (
        <Message
          error
          header="Action Forbidden"
          content="Some fields are required!"
        />
      )}
      {createAccountResult.isError && (
        <Message negative>
          <Message.Header> There's been an error</Message.Header>
          {renderErrorMessage(createAccountResult.error)}
        </Message>
      )}
      {updateAccountResult.isError && (
        <Message negative>
          <Message.Header> There's been an error</Message.Header>
          {renderErrorMessage(updateAccountResult.error)}
        </Message>
      )}
    </FormModal>
  );
}
