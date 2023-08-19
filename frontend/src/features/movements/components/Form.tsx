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
  onMutate?: () => void;
}) {
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [movementId, setMovementId] = useState(props.movementId || 0);
  const [selectedTransaction, setSelectedTransaction] = useState<
    TransactionApiOut | undefined
  >(undefined);

  const movementQuery =
    api.endpoints.readApiUsersMeMovementsMovementIdGet.useQuery(
      movementId || skipToken
    );

  const [createMovements, createMovementsResult] =
    api.endpoints.createManyApiUsersMeAccountsAccountIdMovementsPost.useMutation();

  const [updateTransaction, updateTransactionResult] =
    api.endpoints.updateApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdPut.useMutation();

  const [deleteMovement, deleteMovementResult] =
    api.endpoints.deleteApiUsersMeMovementsMovementIdDelete.useMutation();

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

  function handleCloseCreateTransactionForm() {
    setIsTransactionFormOpen(false);
  }

  function handleCloseAddTransactionForm() {
    setIsTransactionFormOpen(false);
  }

  function handleCloseEditTransactionForm() {
    setSelectedTransaction(undefined);
    setIsTransactionFormOpen(false);
  }

  async function handleAddTransaction(transaction: TransactionApiOut) {
    if (movementId) {
      try {
        await updateTransaction({
          accountId: transaction.account_id,
          movementId: transaction.movement_id,
          transactionId: transaction.id,
          transactionApiIn: {
            ...transaction,
          },
          newMovementId: movementId,
        }).unwrap();
        props.onMutate && props.onMutate();
      } catch (error) {
        logMutationError(error, updateTransactionResult);
        return;
      }
    } else {
      try {
        const [movement] = await createMovements({
          accountId: transaction.account_id,
          bodyCreateManyApiUsersMeAccountsAccountIdMovementsPost: {
            transactions: [],
            transaction_ids: [transaction.id],
          },
        }).unwrap();
        setMovementId(movement.id);
        props.onMutate && props.onMutate();
      } catch (error) {
        logMutationError(error, createMovementsResult);
        return;
      }
    }
  }

  async function handleRemoveTransaction(transaction: TransactionApiOut) {
    try {
      await createMovements({
        accountId: transaction.account_id,
        bodyCreateManyApiUsersMeAccountsAccountIdMovementsPost: {
          transactions: [],
          transaction_ids: [transaction.id],
        },
      }).unwrap();
      props.onMutate && props.onMutate();
    } catch (error) {
      logMutationError(error, createMovementsResult);
      return;
    }
  }

  async function handleDelete() {
    if (!movementId) return;

    try {
      await deleteMovement(movementId).unwrap();
      props.onMutate && props.onMutate();
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
              transaction={selectedTransaction}
              open={isTransactionFormOpen}
              onClose={handleCloseEditTransactionForm}
              onEdited={props.onMutate && ((t) => props.onMutate!())}
            />
          ) : (
            <TransactionForm.Add
              open={isTransactionFormOpen}
              onClose={handleCloseAddTransactionForm}
              movementId={movementId}
              onAdded={props.onMutate && ((t) => props.onMutate!())}
            />
          )}
        </>
      ) : (
        <TransactionForm.Create
          open={isTransactionFormOpen}
          onClose={handleCloseCreateTransactionForm}
          onCreated={(m) => {
            setMovementId(m.id);
            props.onMutate && props.onMutate();
          }}
        />
      )}
      <Modal.Header>Create a Movement</Modal.Header>
      <Modal.Content>
        <FlexColumn style={{ height: "70vh" }}>
          {movementQuery.isUninitialized && (
            <Segment placeholder>
              <Header icon>Add transactions here</Header>
              <Segment.Inline>
                <CreateNewButton onCreate={handleOpenCreateTransactionForm} />
              </Segment.Inline>
            </Segment>
          )}
          {movementQuery.isFetching ? (
            <MovementCard.Placeholder
              onOpenCreateTransactionForm
              onOpenEditTransactionForm
              onRemoveTransaction
            />
          ) : (
            <>
              {movementQuery.isSuccess && (
                <div
                  style={{
                    maxHeight: "35vh",
                    overflow: "auto",
                    padding: 2,
                  }}
                >
                  <MovementCard
                    movement={movementQuery.data}
                    onOpenCreateTransactionForm={
                      handleOpenCreateTransactionForm
                    }
                    onOpenEditTransactionForm={handleOpenEditTransactionForm}
                    onRemoveTransaction={
                      movementQuery.data.transactions.length > 1
                        ? handleRemoveTransaction
                        : undefined
                    }
                  />
                </div>
              )}
              {movementQuery.isError && (
                <QueryErrorMessage query={movementQuery} />
              )}
            </>
          )}
          <QueryErrorMessage query={createMovementsResult} />
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
