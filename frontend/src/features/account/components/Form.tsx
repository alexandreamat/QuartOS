import { Button, Form, Modal } from "semantic-ui-react";
import { useEffect } from "react";
import {
  AccountApiOut,
  AccountApiIn,
  api,
  AccountType,
} from "app/services/api";
import useFormField from "hooks/useFormField";
import FormTextInput from "components/FormTextInput";
import FormDropdownInput from "components/FormDropdownInput";
import { useLocation } from "react-router-dom";
import { useInstitutionLinkOptions } from "features/institutionlink/hooks";
import { capitaliseFirstLetter } from "utils/string";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { FormValidationError } from "components/FormValidationError";
import { logMutationError } from "utils/error";
import ConfirmDeleteButtonModal from "components/ConfirmDeleteButtonModal";
import FormCurrencyCodeDropdown from "components/FormCurrencyCodeDropdown";

export default function AccountForm(props: {
  account?: AccountApiOut;
  open: boolean;
  onClose: () => void;
}) {
  const isInstitutional = useFormField(false);
  const mask = useFormField("");
  const name = useFormField("");
  const bic = useFormField("");
  const iban = useFormField("");
  const currencyCode = useFormField("");
  const type = useFormField<AccountType | undefined>(undefined);
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
    bic,
    iban,
    name,
    currencyCode,
    type,
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
    type.set(props.account.type);
    if (
      props.account.type === "depository" ||
      props.account.type === "loan" ||
      props.account.type === "credit"
    ) {
      isInstitutional.set(true);
      institutionLinkId.set(props.account.userinstitutionlink_id);
      if (props.account.type === "depository") {
        bic.set(props.account.bic);
        iban.set(props.account.iban);
      }
    } else {
      isInstitutional.set(false);
    }
  }, [props.account]);

  const handleClose = () => {
    fields.forEach((field) => field.reset());
    props.onClose();
  };

  const institutionalTypeOptions = [
    // "investment",
    "credit",
    "depository",
    "loan",
    // "brokerage",
    // "other",
  ].map((type, index) => ({
    key: index,
    value: type,
    text: capitaliseFirstLetter(type),
  }));

  const nonInstitutionalTypeOptions: {
    key: number;
    value: AccountType;
    text: string;
  }[] = [
    { key: 1, value: "personal_ledger", text: "Personal Ledger" },
    { key: 1, value: "cash", text: "Cash" },
    { key: 1, value: "property", text: "Property" },
  ];

  async function handleSubmit() {
    const formFields = [
      ...requiredFields,
      ...(isInstitutional.value
        ? [type, institutionLinkId, mask, bic, iban]
        : [type]),
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
      type: type.value!,
      bic: bic.value!,
      iban: iban.value!,
    };
    if (props.account) {
      try {
        await updateAccount({
          accountId: props.account.id,
          body: account,
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
          body: account,
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
          <FormTextInput
            readOnly={props.account?.is_synced}
            label="Account Name"
            field={name}
          />
          <Form.Checkbox
            disabled={props.account?.is_synced}
            label="Link to a financial institution"
            checked={isInstitutional.value}
            onChange={(_, data) => {
              type.reset();
              isInstitutional.reset();
              isInstitutional.set(data.checked);
            }}
          />
          {isInstitutional.value ? (
            <>
              <FormDropdownInput
                readOnly={props.account?.is_synced}
                label="Institution"
                field={institutionLinkId}
                options={institutionLinkOptions.data || []}
                query={institutionLinkOptions.query}
              />
              <FormDropdownInput
                readOnly={props.account?.is_synced}
                label="Type"
                field={type}
                options={institutionalTypeOptions}
              />
              <FormTextInput
                label="Account Number"
                field={mask}
                readOnly={props.account?.is_synced}
              />
            </>
          ) : (
            <>
              <FormDropdownInput
                label="Type"
                field={type}
                options={nonInstitutionalTypeOptions}
              />
            </>
          )}
          <Form.Group widths="equal">
            <FormCurrencyCodeDropdown
              label="Currency"
              disabled={props.account?.is_synced}
              currencyCode={currencyCode}
            />
            <Form.Input
              type="number"
              input={{
                inputMode: "decimal",
                step: "0.01",
              }}
              label="Initial Amount"
              placeholder={"Enter initial amount"}
              required
              value={initialBalanceStr.value}
              onChange={(_, data) => {
                initialBalanceStr.reset();
                initialBalanceStr.set(data.value as string);
              }}
              error={initialBalanceStr.isError}
            />
          </Form.Group>
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
