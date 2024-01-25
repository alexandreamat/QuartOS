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
  MovementApiOut,
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
import { capitaliseFirstLetter } from "utils/string";

export default function TransactionForm<R, A, Q extends BaseQueryFn>(
  props: {
    // Common
    title: string;
    open: boolean;
    onClose: () => void;
  } & (
    | {
        // Create tx
        onSubmit: (x: TransactionApiIn, y: number) => Promise<void>;
        submitResult: TypedUseMutationResult<R, A, Q>;
      }
    | {
        // Add new tx to movement
        movementId: number;
        onSubmit: (x: TransactionApiIn, y: number) => Promise<void>;
        submitResult: TypedUseMutationResult<R, A, Q>;
      }
    | {
        // Edit existing tx
        movementId: number;
        transaction: TransactionApiOut;
        onSubmit: (x: TransactionApiIn, y: number) => Promise<void>;
        submitResult: TypedUseMutationResult<R, A, Q>;
        onDelete: () => Promise<void>;
        deleteResult: TypedUseMutationResult<R, A, Q>;
        onUpload: (file: File) => void;
        uploadResult: TypedUseMutationResult<R, A, Q>;
      }
  ),
) {
  const isEdit = "transaction" in props;
  const hasMovement = "movementId" in props;

  const filesQuery =
    api.endpoints.readManyUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesGet.useQuery(
      isEdit
        ? {
            accountId: props.transaction.account_id,
            movementId: props.transaction.movement_id,
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

  const movementQuery =
    api.endpoints.readUsersMeMovementsMovementIdGet.useQuery(
      hasMovement ? props.movementId : skipToken,
    );

  const disableSynced = isEdit && props.transaction.is_synced;

  const accountOptions = useAccountOptions();

  useEffect(() => {
    if (isEdit) return;
    if (!movementQuery.isSuccess) return;
    const movement = movementQuery.data;
    const timestamp = movement.timestamp;
    form.timestamp.set(timestamp ? stringToDate(timestamp) : new Date());
    form.name.set(movement.name);
  }, [movementQuery.isSuccess, movementQuery.data, props.open]);

  useEffect(() => {
    isEdit && transactionApiOutToForm(props.transaction, form);
  }, [isEdit, props.open]);

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
    <Modal open={props.open} onClose={handleClose} size="small">
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
          {movementQuery.isSuccess && accountQuery.data?.currency_code && (
            <CurrencyExchangeTips
              movementId={movementQuery.data.id}
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
          <ConfirmDeleteButtonModal
            onDelete={handleDelete}
            query={props.deleteResult}
          />
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

function FormCreate(props: {
  open: boolean;
  onClose: () => void;
  onSuccess: (x: MovementApiOut) => void;
}) {
  const [createMovement, createMovementResult] =
    api.endpoints.createManyUsersMeAccountsAccountIdMovementsPost.useMutation();

  const handleSubmit = async (
    transaction: TransactionApiIn,
    accountId: number,
  ) => {
    try {
      const [movement] = await createMovement({
        accountId: accountId,
        bodyCreateManyUsersMeAccountsAccountIdMovementsPost: {
          transactions: [transaction],
          transaction_ids: [],
        },
      }).unwrap();
      props.onSuccess(movement);
    } catch (error) {
      logMutationError(error, createMovementResult);
      throw error;
    }
  };

  return (
    <TransactionForm
      title="Create a Transaction"
      open={props.open}
      onClose={props.onClose}
      onSubmit={handleSubmit}
      submitResult={createMovementResult}
    />
  );
}

function FormAdd(props: {
  open: boolean;
  movementId: number;
  onClose: () => void;
  onAdded?: (x: TransactionApiOut) => void;
}) {
  const [createTransaction, createTransactionResult] =
    api.endpoints.createUsersMeAccountsAccountIdMovementsMovementIdTransactionsPost.useMutation();

  const handleSubmit = async (
    transactionIn: TransactionApiIn,
    accountId: number,
  ) => {
    try {
      const transactionOut = await createTransaction({
        accountId: accountId,
        movementId: props.movementId,
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
      title="Add a Transaction to Movement"
      open={props.open}
      onClose={props.onClose}
      movementId={props.movementId}
      onSubmit={handleSubmit}
      submitResult={createTransactionResult}
    />
  );
}

function FormEdit(props: {
  open: boolean;
  onClose: () => void;
  transaction: TransactionApiOut;
  movementId: number;
  onEdited?: () => void;
}) {
  const [updateTransaction, updateTransactionResult] =
    api.endpoints.updateUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdPut.useMutation();

  const [deleteTransaction, deleteTransactionResult] =
    api.endpoints.deleteUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdDelete.useMutation();

  const uploadTransactionFile = useUploadTransactionFile(props.transaction);

  async function handleSubmit(
    transactionIn: TransactionApiIn,
    accountId: number,
  ) {
    try {
      await updateTransaction({
        accountId: accountId,
        movementId: props.transaction.movement_id,
        transactionId: props.transaction.id,
        transactionApiInInput: transactionIn,
        newMovementId: props.transaction.movement_id,
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
        movementId: props.transaction.movement_id,
        transactionId: props.transaction.id,
      });
    } catch (error) {
      logMutationError(error, deleteTransactionResult);
      throw error;
    }
  }

  return (
    <TransactionForm
      title="Edit a Transaction"
      open={props.open}
      onClose={props.onClose}
      movementId={props.movementId}
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
    />
  );
}

TransactionForm.Create = FormCreate;
TransactionForm.Add = FormAdd;
TransactionForm.Edit = FormEdit;
