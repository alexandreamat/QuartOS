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
  AccountApiOut,
  BodyPreviewUsersMeAccountsAccountIdTransactionsPreviewPost,
  api,
  transactionApiInToRaw,
} from "app/services/api";
import FlexColumn from "components/FlexColumn";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import UploadSegment from "components/UploadSegment";
import { TransactionCard } from "features/transaction/components/TransactionCard";
import { useCheckboxes } from "hooks/useCheckboxes";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Dimmer,
  Icon,
  Loader,
  Message,
  Modal,
} from "semantic-ui-react";
import { logMutationError } from "utils/error";

export default function Uploader(props: {
  account: AccountApiOut;
  onClose: () => void;
}) {
  const checkboxes = useCheckboxes();
  const [showDupsWarn, setShowDupsWarn] = useState(false);

  const lastTransactionQuery =
    api.endpoints.readManyUsersMeAccountsAccountIdTransactionsGet.useQuery({
      accountId: props.account.id,
      perPage: 1,
      page: 0,
      orderBy: "timestamp__desc",
    });

  const [preview, previewResult] =
    api.endpoints.previewUsersMeAccountsAccountIdTransactionsPreviewPost.useMutation();

  const transactionsIn = previewResult.data || [];

  const lastTransaction = useMemo(
    () =>
      lastTransactionQuery.isSuccess && lastTransactionQuery.data.length
        ? lastTransactionQuery.data[0]
        : undefined,
    [lastTransactionQuery],
  );

  function handleSelectAll() {
    transactionsIn.forEach((t, i) => checkboxes.onChange(i, true));
  }

  function handleClearAll() {
    checkboxes.reset();
  }

  const handleClose = () => {
    setShowDupsWarn(false);
    previewResult.reset();
    props.onClose();
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      await preview({
        accountId: props.account.id,
        bodyPreviewUsersMeAccountsAccountIdTransactionsPreviewPost:
          formData as unknown as BodyPreviewUsersMeAccountsAccountIdTransactionsPreviewPost,
      }).unwrap();
    } catch (error) {
      logMutationError(error, previewResult);
      return;
    }
  };

  useEffect(() => {
    if (!transactionsIn || !lastTransaction) return;

    transactionsIn.forEach((transactionIn, i) => {
      if (transactionIn.timestamp <= lastTransaction.timestamp) {
        setShowDupsWarn(true);
        checkboxes.onChange(i, false);
      } else {
        checkboxes.onChange(i, true);
      }
    });
  }, [transactionsIn, lastTransaction]);

  const [createTransactions, createTransactionsResult] =
    api.endpoints.createManyUsersMeAccountsAccountIdTransactionsBatchPost.useMutation();

  async function handleCreateTransactions() {
    if (!transactionsIn) return;

    const transactions = transactionsIn.filter((_, i) =>
      checkboxes.checked.has(i),
    );
    try {
      await createTransactions({
        accountId: props.account.id,
        body: transactions.map(transactionApiInToRaw),
      }).unwrap();
    } catch (error) {
      logMutationError(error, createTransactionsResult);
      return;
    }
    handleClose();
  }

  return (
    <Modal open onClose={props.onClose}>
      <Modal.Header>Upload Transactions File</Modal.Header>
      <Modal.Content>
        <FlexColumn style={{ height: "calc(80vh - 10em)" }}>
          {props.account.is_synced && (
            <Message warning icon>
              <Icon name="exclamation triangle" />
              <Message.Content>
                <Message.Header>Synced Account</Message.Header>
                You are about to upload transactions for an account that is
                synced with your institution. This is only advised to upload
                transactions that cannot be synced automatically.
              </Message.Content>
            </Message>
          )}
          {showDupsWarn && (
            <Message warning icon>
              <Icon name="exclamation triangle" />
              <Message.Content>
                <Message.Header>Duplicate Entries Warning</Message.Header>
                The transactions sheet you have uploaded might overlap with
                existing transactions previously updated.
              </Message.Content>
            </Message>
          )}
          {previewResult.isUninitialized && (
            <UploadSegment onUpload={handleFileUpload} />
          )}
          {previewResult.isLoading && (
            <Dimmer active>
              <Loader active />
            </Dimmer>
          )}
          {createTransactionsResult.isLoading && (
            <Dimmer active>
              <Loader active />
            </Dimmer>
          )}
          <QueryErrorMessage query={previewResult} />
          <QueryErrorMessage query={createTransactionsResult} />
          <FlexColumn.Auto>
            {transactionsIn && (
              <Card.Group style={{ margin: 0 }}>
                {transactionsIn.map((t, i) => (
                  <TransactionCard.Preview
                    key={i}
                    transaction={t}
                    accountId={props.account.id}
                    checked={checkboxes.checked.has(i)}
                    onCheckedChange={(x) => {
                      checkboxes.onChange(i, x);
                    }}
                  />
                ))}
              </Card.Group>
            )}
          </FlexColumn.Auto>
        </FlexColumn>
      </Modal.Content>
      <Modal.Actions>
        <Button
          compact
          onClick={handleSelectAll}
          floated="left"
          disabled={
            transactionsIn
              ? checkboxes.checked.size === transactionsIn.length
              : true
          }
        >
          Select All
        </Button>
        <Button
          compact
          onClick={handleClearAll}
          floated="left"
          disabled={transactionsIn ? checkboxes.checked.size === 0 : true}
        >
          Clear All
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={!previewResult.isSuccess || checkboxes.checked.size === 0}
          content={`Upload ${checkboxes.checked.size} ${
            checkboxes.checked.size === 1 ? "transaction" : "transactions"
          }`}
          labelPosition="right"
          icon="checkmark"
          onClick={handleCreateTransactions}
          positive
        />
      </Modal.Actions>
    </Modal>
  );
}
