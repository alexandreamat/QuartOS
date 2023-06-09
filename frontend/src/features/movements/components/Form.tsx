import { useEffect, useState } from "react";
import TransactionCards from "features/transaction/components/TransactionCards";
import { Button, Divider, Header, Modal, Segment } from "semantic-ui-react";
import FlexColumn from "components/FlexColumn";
import { TransactionApiOut, api } from "app/services/api";
import { logMutationError } from "utils/error";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import ConfirmDeleteButtonModal from "components/ConfirmDeleteButtonModal";
import CreateNewButton from "components/CreateNewButton";
import TransactionForm from "features/transaction/components/Form";
import { MovementCard } from "./MovementCard";

export default function Form(props: {
  open: boolean;
  onClose: () => void;
  movementId?: number;
}) {
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [movementId, setMovementId] = useState(props.movementId || 0);
  const [selectedTransaction, setSelectedTransaction] = useState<
    TransactionApiOut | undefined
  >(undefined);

  const movementQuery = api.endpoints.readApiMovementsIdGet.useQuery(
    movementId || skipToken
  );

  const [createMovement, createMovementResult] =
    api.endpoints.createApiMovementsPost.useMutation();

  const [updateTransaction, updateTransactionResult] =
    api.endpoints.updateTransactionApiMovementsIdTransactionsTransactionIdPut.useMutation();

  const [deleteMovement, deleteMovementResult] =
    api.endpoints.deleteApiMovementsIdDelete.useMutation();

  useEffect(() => {
    if (props.movementId) setMovementId(props.movementId);
  }, [props.movementId]);

  function handleClose() {
    setMovementId(0);
    setSelectedTransaction(undefined);
    setIsTransactionFormOpen(false);
    props.onClose();
  }

  function handleOpenCreateTransactionForm() {
    setSelectedTransaction(undefined);
    setIsTransactionFormOpen(true);
  }

  function handleOpenEditTransactionForm(transaction: TransactionApiOut) {
    setSelectedTransaction(transaction);
    setIsTransactionFormOpen(true);
  }

  async function handleAddTransaction(transaction: TransactionApiOut) {
    if (movementId) {
      const transactionMovementId = transaction.movement_id;
      try {
        await updateTransaction({
          id: transactionMovementId,
          transactionId: transaction.id,
          transactionApiIn: {
            ...transaction,
            movement_id: movementId,
          },
        }).unwrap();
      } catch (error) {
        logMutationError(error, updateTransactionResult);
        return;
      }
    } else {
      try {
        const [movement] = await createMovement({
          transactions: [],
          transaction_ids: [transaction.id],
        }).unwrap();
        setMovementId(movement.id);
      } catch (error) {
        logMutationError(error, createMovementResult);
        return;
      }
    }
  }

  async function handleRemoveTransaction(transaction: TransactionApiOut) {
    try {
      await createMovement({
        transactions: [],
        transaction_ids: [transaction.id],
      }).unwrap();
    } catch (error) {
      logMutationError(error, createMovementResult);
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

  async function handleFlowCheckboxChange(
    transaction: TransactionApiOut,
    checked: boolean
  ) {
    if (checked) {
      await handleAddTransaction(transaction);
    } else {
      await handleRemoveTransaction(transaction);
    }
  }

  return (
    <Modal open={props.open} onClose={handleClose} size="fullscreen">
      {movementId ? (
        <>
          {selectedTransaction ? (
            <TransactionForm.Edit
              movementId={movementId}
              onClose={() => setIsTransactionFormOpen(false)}
              open={isTransactionFormOpen}
              transaction={selectedTransaction}
            />
          ) : (
            <TransactionForm.Add
              open={isTransactionFormOpen}
              onClose={() => setIsTransactionFormOpen(false)}
              movementId={movementId}
              onAdded={(m) => setMovementId(m.id)}
            />
          )}
        </>
      ) : (
        <TransactionForm.Create
          open={isTransactionFormOpen}
          onClose={() => setIsTransactionFormOpen(false)}
          onCreated={(m) => {}}
        />
      )}
      <Modal.Header>Create a Movement</Modal.Header>
      <Modal.Content>
        <div style={{ height: "70vh" }}>
          <FlexColumn>
            {movementQuery.isSuccess ? (
              <MovementCard
                movement={movementQuery.data}
                onOpenCreateTransactionForm={handleOpenCreateTransactionForm}
                onOpenEditTransactionForm={handleOpenEditTransactionForm}
                onRemoveTransaction={
                  movementQuery.data.transactions.length > 1
                    ? handleRemoveTransaction
                    : undefined
                }
              />
            ) : (
              <Segment placeholder>
                <Header icon>Add transactions here</Header>
                <Segment.Inline>
                  <CreateNewButton onCreate={handleOpenCreateTransactionForm} />
                </Segment.Inline>
              </Segment>
            )}
            <QueryErrorMessage query={createMovementResult} />
            <QueryErrorMessage query={updateTransactionResult} />
            <QueryErrorMessage query={deleteMovementResult} />
            <FlexColumn.Auto>
              <Divider horizontal>or pick existing ones</Divider>
              <TransactionCards
                onMutation={handleOpenCreateTransactionForm}
                onFlowCheckboxChange={handleFlowCheckboxChange}
                checked={movementQuery.data?.transactions.map((t) => t.id)}
              />
            </FlexColumn.Auto>
          </FlexColumn>
        </div>
      </Modal.Content>
      <Modal.Actions>
        {movementId !== 0 && (
          <ConfirmDeleteButtonModal
            onDelete={handleDelete}
            query={deleteMovementResult}
          />
        )}
        <Button
          content="Done"
          labelPosition="right"
          icon="checkmark"
          onClick={handleClose}
          positive
        />
      </Modal.Actions>
    </Modal>
  );
}
