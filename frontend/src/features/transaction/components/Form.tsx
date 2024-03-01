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

import { BaseQueryFn, skipToken } from "@reduxjs/toolkit/dist/query";
import { TypedUseMutationResult } from "@reduxjs/toolkit/dist/query/react";
import {
  TransactionGroupApiIn,
  TransactionGroupApiOut,
  TransactionApiIn,
  TransactionApiOut,
  api,
} from "app/services/api";
import ConfirmDeleteButtonModal from "components/ConfirmDeleteButtonModal";
import FormCurrencyInput from "components/FormCurrencyInput";
import FormDateTimeInput from "components/FormDateTimeInput";
import FormDropdownInput from "components/FormDropdownInput";
import FormTextInput from "components/FormTextInput";
import { FormValidationError } from "components/FormValidationError";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import UploadButton from "components/UploadButton";
import { useAccountOptions } from "features/account/hooks";
import useFormField from "hooks/useFormField";
import { useEffect } from "react";
import {
  Button,
  Form,
  Icon,
  Message,
  Modal,
  Placeholder,
} from "semantic-ui-react";
import { logMutationError } from "utils/error";
import { stringToDate } from "utils/time";
import { useUploadTransactionFile } from "../hooks/useUploadTransactionFile";
import { TransactionApiInForm } from "../types";
import { transactionApiOutToForm, transactionFormToApiIn } from "../utils";
import CurrencyExchangeTips from "./CurrencyExchangeTips";
import CategoriesDropdown from "features/categories/components/CategoriesDropdown";
import CurrencyLabel from "components/CurrencyLabel";

export default function TransactionForm<R, A, Q extends BaseQueryFn>(
  props: {
    // Common
    title: string;
    onClose: () => void;
  } & (
    | {
        // Create tx
        onSubmit: (x: TransactionApiIn, y: number) => Promise<void>;
        submitResult: TypedUseMutationResult<R, A, Q>;
      }
    | {
        // Edit existing tx
        transactionGroupId: number;
        transaction: TransactionApiOut;
        onSubmit: (x: TransactionApiIn, y: number) => Promise<void>;
        submitResult: TypedUseMutationResult<R, A, Q>;
        onDelete: () => Promise<void>;
        deleteResult: TypedUseMutationResult<R, A, Q>;
        onUpload: (file: File) => void;
        uploadResult: TypedUseMutationResult<R, A, Q>;
        onRemoveFromGroup: () => Promise<void>;
        removeFromGroupResult: TypedUseMutationResult<R, A, Q>;
      }
  ),
) {
  const isEdit = "transaction" in props;
  const hasTransactionGroup = "transactionGroupId" in props;

  const filesQuery =
    api.endpoints.readManyUsersMeAccountsAccountIdTransactionsTransactionIdFilesGet.useQuery(
      isEdit
        ? {
            accountId: props.transaction.account_id,
            transactionId: props.transaction.id,
          }
        : skipToken,
    );

  const form: TransactionApiInForm = {
    amountStr: useFormField(isEdit ? props.transaction.amount : "", "amount"),
    timestamp: useFormField(
      isEdit ? stringToDate(props.transaction.timestamp) : new Date(),
      "date",
    ),
    name: useFormField(isEdit ? props.transaction.name : "", "name"),
    accountId: useFormField(
      isEdit ? props.transaction.account_id : 0,
      "account",
    ),
    categoryId: useFormField(
      isEdit ? props.transaction.category_id || 0 : 0,
      "category",
    ),
  };

  const accountQuery = api.endpoints.readUsersMeAccountsAccountIdGet.useQuery(
    form.accountId.value || skipToken,
  );

  const transactionGroupQuery =
    api.endpoints.readUsersMeTransactiongroupsTransactionGroupIdGet.useQuery(
      hasTransactionGroup ? props.transactionGroupId : skipToken,
    );

  const disableSynced = isEdit && props.transaction.is_synced;

  const accountOptions = useAccountOptions();

  useEffect(() => {
    if (isEdit) return;
    if (!transactionGroupQuery.isSuccess) return;
    const transactionGroup = transactionGroupQuery.data;
    const timestamp = transactionGroup.timestamp;
    form.timestamp.set(timestamp ? stringToDate(timestamp) : new Date());
    form.name.set(transactionGroup.name);
  }, [transactionGroupQuery.isSuccess, transactionGroupQuery.data]);

  useEffect(() => {
    isEdit && transactionApiOutToForm(props.transaction, form);
  }, [isEdit]);

  const handleSubmit = async () => {
    const invalidFields = Object.values(form).filter(
      (field) => !field.validate(),
    );
    if (invalidFields.length > 0) return;
    const transactionIn = transactionFormToApiIn(form);
    try {
      await props.onSubmit(transactionIn, form.accountId.value!);
    } catch (error) {
      return;
    }
    handleClose();
  };

  async function handleDelete() {
    if (!isEdit || !props.onDelete) return;
    try {
      await props.onDelete();
    } catch (error) {
      return;
    }
    handleClose();
  }

  const handleClose = () => {
    Object.values(form).forEach((field) => field.reset());
    props.onClose();
  };

  const { timestamp, ...comparableForm } = form;
  const hasChanged =
    isEdit &&
    (Object.values(comparableForm).some((v) => v.hasChanged) ||
      timestamp.value?.getTime() !==
        stringToDate(props.transaction.timestamp).getTime());

  return (
    <Modal open onClose={handleClose} size="small">
      <Modal.Header>{props.title}</Modal.Header>
      <Modal.Content>
        <Form>
          <FormDropdownInput
            field={form.accountId}
            options={accountOptions.options}
            query={accountOptions.query}
            readOnly={disableSynced}
          />
          <CategoriesDropdown.Form categoryId={form.categoryId} />
          <FormCurrencyInput
            query={accountQuery}
            field={form.amountStr}
            currency={accountQuery.data?.currency_code}
            readOnly={disableSynced}
          />
          {transactionGroupQuery.isSuccess &&
            accountQuery.data?.currency_code && (
              <CurrencyExchangeTips
                transactionGroupId={transactionGroupQuery.data.id}
                currencyCode={accountQuery.data.currency_code}
              />
            )}
          <FormTextInput field={form.name} readOnly={disableSynced} />
          <FormDateTimeInput field={form.timestamp} readOnly={disableSynced} />
          <FormValidationError fields={Object.values(form)} />
          <QueryErrorMessage query={props.submitResult} />
          {disableSynced && (
            <Message info icon>
              <Icon name="info circle" />
              <Message.Content>
                This transaction is synchronised with your institution, and is
                not fully editable.
              </Message.Content>
            </Message>
          )}
          {isEdit && (
            <>
              <UploadButton
                disabled={!filesQuery.isSuccess}
                onUpload={props.onUpload}
                negative={props.uploadResult.isError}
                loading={props.uploadResult.isLoading}
              />
              {filesQuery.isFetching || filesQuery.isUninitialized ? (
                <Placeholder>
                  <Placeholder.Line />
                </Placeholder>
              ) : filesQuery.isError ? (
                <QueryErrorMessage query={filesQuery} />
              ) : (
                filesQuery.isSuccess && (
                  <p>
                    {filesQuery.data.length === 0
                      ? "No files uploaded"
                      : filesQuery.data.length === 1
                      ? "1 File uploaded"
                      : `${filesQuery.data.length} files uploaded`}
                  </p>
                )
              )}
            </>
          )}
        </Form>
      </Modal.Content>
      <Modal.Actions>
        {isEdit && (
          <>
            <ConfirmDeleteButtonModal
              onSubmit={handleDelete}
              query={props.deleteResult}
            />
            {props.transaction.transaction_group_id && (
              <Button
                negative
                floated="left"
                labelPosition="left"
                content="Remove from group"
                loading={props.removeFromGroupResult.isLoading}
                icon="object ungroup"
                onClick={props.onRemoveFromGroup}
              />
            )}
          </>
        )}
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={isEdit ? !hasChanged : false}
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

function FormCreate(props: { onClose: () => void }) {
  const [createTransaction, createTransactionResult] =
    api.endpoints.createManyUsersMeAccountsAccountIdTransactionsBatchPost.useMutation();

  const handleSubmit = async (
    transactionIn: TransactionApiIn,
    accountId: number,
  ) => {
    try {
      await createTransaction({
        accountId: accountId,
        body: [transactionIn],
      }).unwrap();
    } catch (error) {
      logMutationError(error, createTransactionResult);
      throw error;
    }
  };

  return (
    <TransactionForm
      title="Create a Transaction"
      onClose={props.onClose}
      onSubmit={handleSubmit}
      submitResult={createTransactionResult}
    />
  );
}

function FormAdd(props: {
  transactionGroupId: number;
  onClose: () => void;
  onAdded?: (x: TransactionApiOut) => void;
}) {
  const [createTransaction, createTransactionResult] =
    api.endpoints.createUsersMeAccountsAccountIdTransactionsPost.useMutation();

  const handleSubmit = async (
    transactionIn: TransactionApiIn,
    accountId: number,
  ) => {
    try {
      const transactionOut = await createTransaction({
        accountId: accountId,
        transactionGroupId: props.transactionGroupId,
        transactionApiInInput: transactionIn,
      }).unwrap();
      props.onAdded && props.onAdded(transactionOut);
    } catch (error) {
      logMutationError(error, createTransactionResult);
      throw error;
    }
  };

  return (
    <TransactionForm
      title="Add a Transaction to TransactionGroup"
      onClose={props.onClose}
      transactionGroupId={props.transactionGroupId}
      onSubmit={handleSubmit}
      submitResult={createTransactionResult}
    />
  );
}

function FormEdit(props: {
  onClose: () => void;
  transaction: TransactionApiOut;
  onEdited?: () => void;
}) {
  const [updateTransaction, updateTransactionResult] =
    api.endpoints.updateUsersMeAccountsAccountIdTransactionsTransactionIdPut.useMutation();

  const [deleteTransaction, deleteTransactionResult] =
    api.endpoints.deleteUsersMeAccountsAccountIdTransactionsTransactionIdDelete.useMutation();

  const [ungroup, ungroupResult] =
    api.endpoints.removeUsersMeTransactiongroupsTransactionGroupIdTransactionsTransactionIdDelete.useMutation();

  const uploadTransactionFile = useUploadTransactionFile(props.transaction);

  async function handleSubmit(
    transactionIn: TransactionApiIn,
    accountId: number,
  ) {
    try {
      await updateTransaction({
        accountId: accountId,
        transactionId: props.transaction.id,
        transactionApiInInput: transactionIn,
      }).unwrap();
      props.onEdited && props.onEdited();
    } catch (error) {
      logMutationError(error, updateTransactionResult);
      throw error;
    }
  }

  async function handleDelete() {
    try {
      await deleteTransaction({
        accountId: props.transaction.account_id,
        transactionId: props.transaction.id,
      });
    } catch (error) {
      logMutationError(error, deleteTransactionResult);
      throw error;
    }
  }

  async function handleRemove() {
    if (!props.transaction.transaction_group_id) return;
    try {
      await ungroup({
        transactionGroupId: props.transaction.transaction_group_id,
        transactionId: props.transaction.id,
      }).unwrap();
    } catch (error) {
      logMutationError(error, ungroupResult);
      throw error;
    }
  }

  return (
    <TransactionForm
      title="Edit a Transaction"
      onClose={props.onClose}
      transaction={props.transaction}
      onSubmit={handleSubmit}
      submitResult={updateTransactionResult}
      onDelete={handleDelete}
      deleteResult={deleteTransactionResult}
      onUpload={async (f) => {
        await uploadTransactionFile.onUpload(f);
        props.onEdited && props.onEdited();
      }}
      uploadResult={uploadTransactionFile.result}
      onRemoveFromGroup={handleRemove}
      removeFromGroupResult={ungroupResult}
    />
  );
}

function TransactionGroupForm(props: {
  transaction: TransactionGroupApiOut;
  onClose: (transaction?: TransactionGroupApiOut) => void;
}) {
  const [update, updateResult] =
    api.endpoints.updateUsersMeTransactiongroupsTransactionGroupIdPut.useMutation();

  const [ungroup, ungroupResult] =
    api.endpoints.deleteUsersMeTransactiongroupsTransactionGroupIdDelete.useMutation();

  const accountQuery = api.endpoints.readUsersMeAccountsAccountIdGet.useQuery(
    props.transaction.account_id || skipToken,
  );

  const me = api.endpoints.readMeUsersMeGet.useQuery();

  const form = {
    name: useFormField(props.transaction.name, "name"),
    categoryId: useFormField(
      props.transaction.category_id || undefined,
      "category",
    ),
  };

  async function handleUpdate() {
    if (!form.name.value) return;

    try {
      const result = await update({
        transactionGroupId: props.transaction.id,
        transactionGroupApiIn: {
          name: form.name.value,
          category_id: form.categoryId.value,
        },
      }).unwrap();
      props.onClose(result);
    } catch (error) {
      logMutationError(error, updateResult);
      throw error;
    }
  }

  async function handleUngroup() {
    try {
      await ungroup(props.transaction.id);
      props.onClose();
    } catch (error) {
      logMutationError(error, ungroupResult);
      throw error;
    }
  }

  return (
    <Modal open onClose={() => props.onClose()} size="small">
      <Modal.Header>Edit a Transaction Group</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Field>
            <label>Account</label>
            {accountQuery.data ? accountQuery.data.name : "Multiple"}
          </Form.Field>
          <CategoriesDropdown.Form categoryId={form.categoryId} />
          <Form.Field>
            <label>Amount</label>
            <CurrencyLabel
              currencyCode={me.data?.default_currency_code}
              amount={Number(props.transaction.amount_default_currency)}
              loading={me.isLoading}
            />
          </Form.Field>
          <Form.Field>
            <label>Amount (original currency)</label>
            {props.transaction.amount !== null &&
            props.transaction.account_id ? (
              <CurrencyLabel
                currencyCode={accountQuery.data?.currency_code}
                amount={Number(props.transaction.amount)}
                loading={accountQuery.isLoading}
              />
            ) : (
              <p>Multiple currencies</p>
            )}
          </Form.Field>
          <FormTextInput field={form.name} />
          <Form.Field>
            <label>Date</label>
            {stringToDate(props.transaction.timestamp).toLocaleDateString()}
          </Form.Field>
          <FormValidationError fields={Object.values(form)} />
          <QueryErrorMessage query={updateResult} />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <ConfirmDeleteButtonModal
          onSubmit={handleUngroup}
          query={ungroupResult}
          label="Ungroup"
          icon="object ungroup"
        />
        <Button onClick={() => props.onClose()}>Cancel</Button>
        <Button
          disabled={!Object.values(form).some((field) => field.hasChanged)}
          content="Save"
          type="submit"
          labelPosition="right"
          icon="checkmark"
          onClick={handleUpdate}
          positive
        />
      </Modal.Actions>
    </Modal>
  );
}

TransactionForm.Create = FormCreate;
TransactionForm.Add = FormAdd;
TransactionForm.Edit = FormEdit;
FormEdit.Group = TransactionGroupForm;
