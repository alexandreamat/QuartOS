import { Button, Form, Modal } from "semantic-ui-react";
import { useEffect } from "react";
import {
  AccountApiOut,
  AccountApiIn,
  InstitutionalAccountType,
  NonInstitutionalAccountType,
  api,
} from "app/services/api";
import useFormField from "hooks/useFormField";
import FormTextInput from "components/FormTextInput";
import FormCurrencyInputs from "components/FormCurrencyInputs";
import FormDropdownInput from "components/FormDropdownInput";
import { useLocation } from "react-router-dom";
import { useInstitutionLinkOptions } from "features/institutionlink/hooks";
import { capitaliseFirstLetter } from "utils/string";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { FormValidationError } from "components/FormValidationError";
import { logMutationError } from "utils/error";
import ConfirmDeleteButtonModal from "components/ConfirmDeleteButtonModal";

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
  const initialBalanceStr = useFormField("");

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const institutionLinkIdParam = params.get("institutionLinkId");

  const institutionLinkOptions = useInstitutionLinkOptions();

  const [deleteAccount, deleteAccountResult] =
    api.endpoints.deleteApiUsersMeAccountsAccountIdDelete.useMutation();

  useEffect(() => {
    institutionLinkId.set(Number(institutionLinkIdParam));
  }, [institutionLinkIdParam]);

  const fields = [
    mask,
    name,
    currencyCode,
    institutionalType,
    nonInstitutionalType,
    initialBalanceStr,
    institutionLinkId,
    isInstitutional,
  ];

  const requiredFields = [name, currencyCode, initialBalanceStr];

  const [createAccount, createAccountResult] =
    api.endpoints.createApiUsersMeAccountsPost.useMutation();
  const [updateAccount, updateAccountResult] =
    api.endpoints.updateApiUsersMeAccountsAccountIdPut.useMutation();

  useEffect(() => {
    if (!props.account) return;
    name.set(props.account.name);
    currencyCode.set(props.account.currency_code);
    initialBalanceStr.set(props.account.initial_balance.toFixed(2));
    if (props.account.institutionalaccount) {
      const institutionalAccount = props.account.institutionalaccount;
      institutionLinkId.set(institutionalAccount.userinstitutionlink_id);
      institutionalType.set(institutionalAccount.type);
      mask.set(institutionalAccount.mask);
      isInstitutional.set(true);
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
    value: type,
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

  async function handleSubmit() {
    const formFields = [
      ...requiredFields,
      ...(isInstitutional.value
        ? [institutionalType, institutionLinkId, mask]
        : [nonInstitutionalType]),
    ];

    const invalidFields = formFields.reduce(
      (count, field) => count + (field.validate() ? 0 : 1),
      0,
    );

    if (invalidFields > 0) return;

    const account: AccountApiIn = {
      name: name.value!,
      currency_code: currencyCode.value!,
      initial_balance: Number(initialBalanceStr.value!),
      institutionalaccount: isInstitutional.value
        ? {
            mask: mask.value!,
            type: institutionalType.value! as InstitutionalAccountType,
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
          accountId: props.account.id,
          accountApiIn: account,
          userinstitutionlinkId: institutionLinkId.value!,
        }).unwrap();
      } catch (error) {
        logMutationError(error, updateAccountResult);
        return;
      }
    } else {
      try {
        await createAccount({
          userinstitutionlinkId: institutionLinkId.value!,
          accountApiIn: account,
        }).unwrap();
      } catch (error) {
        logMutationError(error, createAccountResult);
        return;
      }
    }
    handleClose();
  }

  async function handleDelete() {
    if (!props.account) return;
    try {
      await deleteAccount(props.account.id).unwrap();
    } catch (error) {
      console.error(deleteAccountResult.originalArgs);
      throw error;
    }
    handleClose();
  }

  return (
    <Modal open={props.open} onClose={handleClose} size="small">
      <Modal.Header>
        {(props.account ? "Edit" : "Add") + " an Account"}
      </Modal.Header>
      <Modal.Content>
        <Form>
          <FormTextInput label="Account Name" field={name} />
          <Form.Checkbox
            label="Link to a financial institution"
            checked={isInstitutional.value}
            onChange={(_, data) => {
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
                query={institutionLinkOptions.query}
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
          <FormCurrencyInputs
            label="Current Balance"
            amount={initialBalanceStr}
            currencyCode={currencyCode}
          />
          <FormValidationError fields={requiredFields} />
          <QueryErrorMessage query={createAccountResult} />
          <QueryErrorMessage query={updateAccountResult} />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <ConfirmDeleteButtonModal
          disabled={props.account?.is_synced}
          onDelete={handleDelete}
          query={deleteAccountResult}
        />
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
