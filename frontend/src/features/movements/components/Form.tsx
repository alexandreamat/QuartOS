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

import { skipToken } from "@reduxjs/toolkit/dist/query";
import { TransactionApiOut, api } from "app/services/api";
import ActionButton from "components/ActionButton";
import ConfirmDeleteButtonModal from "components/ConfirmDeleteButtonModal";
import CreateNewButton from "components/CreateNewButton";
import FlexRow from "components/FlexRow";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import TransactionForm from "features/transaction/components/Form";
import { useEffect, useState } from "react";
import { Button, Header, Modal, Segment } from "semantic-ui-react";
import { logMutationError } from "utils/error";
import AddTransactionsModal from "./AddTransactionsModal";
import { MovementCard } from "./MovementCard";

export default function Form(props: {
  open: boolean;
  onClose: () => void;
  movementId?: number;
  onGoToPrev?: () => void;
  onGoToNext?: () => void;
}) {
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);

  const [movementId, setMovementId] = useState(props.movementId || 0);

  const movementQuery =
    api.endpoints.readUsersMeMovementsMovementIdGet.useQuery(
      (props.open && movementId) || skipToken,
    );

  const [createMovements, createMovementsResult] =
    api.endpoints.createManyUsersMeAccountsAccountIdMovementsPost.useMutation();

  const [deleteMovement, deleteMovementResult] =
    api.endpoints.deleteUsersMeMovementsMovementIdDelete.useMutation();

  useEffect(() => {
    if (props.movementId) setMovementId(props.movementId);
  }, [props.movementId]);

  function handleClose() {
    setMovementId(0);
    setTransactionFormOpen(false);
    props.onClose();
  }

  async function handleRemoveTransaction(transaction: TransactionApiOut) {
    try {
      await createMovements({
        accountId: transaction.account_id,
        bodyCreateManyUsersMeAccountsAccountIdMovementsPost: {
          transactions: [],
          transaction_ids: [transaction.id],
        },
      }).unwrap();
    } catch (error) {
      logMutationError(error, createMovementsResult);
      return;
    }
  }

  async function handleDelete() {
    if (!movementId) return;

    try {
      await deleteMovement(movementId).unwrap();
    } catch (error) {
      logMutationError(error, deleteMovementResult);
      return;
    }
    handleClose();
  }

  return (
    <Modal open={props.open} onClose={handleClose} size="fullscreen">
      {movementId ? (
        <TransactionForm.Add
          open={transactionFormOpen}
          onClose={() => setTransactionFormOpen(false)}
          movementId={movementId}
        />
      ) : (
        <TransactionForm.Create
          open={transactionFormOpen}
          onClose={() => setTransactionFormOpen(false)}
          onSuccess={(m) => setMovementId(m.id)}
        />
      )}
      <Modal.Header>
        {movementId ? "Edit movement" : "Create a movement"}
      </Modal.Header>
      <Modal.Content>
        {movementQuery.isUninitialized ? (
          <Segment placeholder>
            <Header icon>Add transactions here</Header>
            <Segment.Inline>
              <CreateNewButton onCreate={() => setTransactionFormOpen(true)} />
            </Segment.Inline>
          </Segment>
        ) : movementQuery.isError ? (
          <QueryErrorMessage query={movementQuery} />
        ) : (
          <FlexRow gap="10px" alignItems="center">
            <ActionButton
              disabled={!props.onGoToPrev}
              icon="arrow left"
              onClick={props.onGoToPrev}
              tooltip="Previous movement"
            />
            <FlexRow.Auto>
              <MovementCard
                onRemoveTransaction={
                  movementQuery.isSuccess &&
                  movementQuery.data.transactions_count > 1
                    ? handleRemoveTransaction
                    : undefined
                }
                showFlows
                editable
                loading={movementQuery.isFetching}
                movement={movementQuery.data}
              />
            </FlexRow.Auto>
            <ActionButton
              disabled={!props.onGoToNext}
              icon="arrow right"
              onClick={props.onGoToNext}
              tooltip="Next movement"
            />
          </FlexRow>
        )}
        <QueryErrorMessage query={createMovementsResult} />
        <QueryErrorMessage query={deleteMovementResult} />
      </Modal.Content>
      <Modal.Actions>
        {movementId !== 0 && (
          <ConfirmDeleteButtonModal
            onDelete={handleDelete}
            query={deleteMovementResult}
          />
        )}
        {transactionsModalOpen && movementQuery.data && (
          <AddTransactionsModal
            onClose={() => setTransactionsModalOpen(false)}
            movement={movementQuery.data}
          />
        )}
        <Button
          content="Select transactions"
          floated="left"
          color="blue"
          icon="plus square"
          onClick={() => setTransactionsModalOpen(true)}
        />
        <Button
          floated="left"
          icon="plus"
          color="blue"
          onClick={() => setTransactionFormOpen(true)}
          content="Create new Transaction"
        />
        <Button content="Done" onClick={handleClose} />
      </Modal.Actions>
    </Modal>
  );
}
