// Copyright (C) 2024 Alexandre Amat
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import {
  AccountApiIn,
  AccountApiOut,
  AccountType,
  api,
} from "app/services/api";
import ConfirmDeleteButtonModal from "components/ConfirmDeleteButtonModal";
import FormCurrencyInput from "components/FormCurrencyInput";
import FormCurrencyInputs from "components/FormCurrencyInputs";
import FormDropdownInput from "components/FormDropdownInput";
import FormTextInput from "components/FormTextInput";
import { FormValidationError } from "components/FormValidationError";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { useBucketOptions } from "features/buckets/hooks";
import { useInstitutionLinkOptions } from "features/institutionlink/hooks";
import useFormField from "hooks/useFormField";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Button,
  DropdownItemProps,
  Form,
  Input,
  Label,
  Modal,
} from "semantic-ui-react";
import { logMutationError } from "utils/error";
import { capitaliseFirstLetter } from "utils/string";

export default function AccountForm(props: {
  account?: AccountApiOut;
  onClose: () => void;
}) {
  const isInstitutional = useFormField(true);
  const mask = useFormField("");
  const name = useFormField("");
  const currencyCode = useFormField("");
  const type = useFormField<AccountType>();
  const institutionLinkId = useFormField(0);
  const initialBalance = useFormField(0);
  const defaultBucketId = useFormField<number>(undefined, "Default Bucket");

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const institutionLinkIdParam = params.get("institutionLinkId");

  const institutionLinkOptions = useInstitutionLinkOptions();

  const [deleteAccount, deleteAccountResult] =
    api.endpoints.deleteUsersMeAccountsAccountIdDelete.useMutation();

  useEffect(() => {
    institutionLinkId.set(Number(institutionLinkIdParam));
  }, [institutionLinkIdParam]);

  const fields = [
    mask,
    name,
    currencyCode,
    type,
    initialBalance,
    institutionLinkId,
    isInstitutional,
    defaultBucketId,
  ];

  const requiredFields = [name, currencyCode, initialBalance, defaultBucketId];

  const [createAccount, createAccountResult] =
    api.endpoints.createUsersMeAccountsPost.useMutation();
  const [updateAccount, updateAccountResult] =
    api.endpoints.updateUsersMeAccountsAccountIdPut.useMutation();

  useEffect(() => {
    if (!props.account) return;
    name.set(props.account.name);
    currencyCode.set(props.account.currency_code);
    initialBalance.set(props.account.initial_balance);
    type.set(props.account.type);
    isInstitutional.set(props.account.is_institutional);
    defaultBucketId.set(props.account.default_bucket_id || undefined);
    if (props.account.is_institutional) {
      institutionLinkId.set(props.account.user_institution_link_id);
      mask.set(props.account.mask);
    }
  }, [props.account]);

  const bucketOptions = useBucketOptions();

  const handleClose = () => {
    fields.forEach((field) => field.reset());
    props.onClose();
  };

  const institutionalTypeOptions: DropdownItemProps[] = [
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

  const nonInstitutionalTypeOptions: DropdownItemProps[] = [
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
      ...(isInstitutional.value ? [type, institutionLinkId, mask] : [type]),
    ];

    const invalidFields = formFields.reduce(
      (count, field) => count + (field.validate() ? 0 : 1),
      0,
    );

    if (invalidFields > 0) return;

    const account: AccountApiIn = {
      name: name.value!,
      currency_code: currencyCode.value!,
      initial_balance: initialBalance.value!,
      mask: mask.value!,
      type: type.value!,
      default_bucket_id: defaultBucketId.value!,
    };
    if (props.account) {
      try {
        await updateAccount({
          accountId: props.account.id,
          body: account,
          userInstitutionLinkId: institutionLinkId.value!,
        }).unwrap();
      } catch (error) {
        logMutationError(error, updateAccountResult);
        return;
      }
    } else {
      try {
        await createAccount({
          userInstitutionLinkId: institutionLinkId.value!,
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
    <Modal open onClose={handleClose} size="small">
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
              type.reset();
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
                disabled={props.account?.is_synced}
              />
              <FormDropdownInput
                label="Type"
                field={type}
                options={institutionalTypeOptions}
                disabled={props.account?.is_synced}
              />
              <Form.Field required>
                <label>Account Number Mask</label>
                <Input
                  label={<Label>＊＊＊＊</Label>}
                  placeholder="last 4 digits of your account number"
                  value={mask.value}
                  onChange={(e, data) => {
                    mask.reset();
                    mask.set(data.value);
                  }}
                  disabled={props.account?.is_synced}
                />
              </Form.Field>
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
          <FormDropdownInput
            options={bucketOptions.options}
            query={bucketOptions.query}
            field={defaultBucketId}
          />
          {props.account?.is_synced ? (
            <FormCurrencyInput
              label="Initial Balance"
              field={initialBalance}
              currency={currencyCode.value}
            />
          ) : (
            <FormCurrencyInputs
              label="Initial Balance"
              field={initialBalance}
              currencyCode={currencyCode}
            />
          )}
          <FormValidationError fields={requiredFields} />
          <QueryErrorMessage query={createAccountResult} />
          <QueryErrorMessage query={updateAccountResult} />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <ConfirmDeleteButtonModal
          disabled={props.account?.is_synced}
          onSubmit={handleDelete}
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
