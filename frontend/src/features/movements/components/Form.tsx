import { Flows } from "./Flows";
import { useEffect, useState } from "react";
import ManagedTable from "features/transaction/components/ManagedTable";
import { Button, Modal } from "semantic-ui-react";
import FlexColumn from "components/FlexColumn";
import { TransactionApiOut, api } from "app/services/api";
import { logMutationError } from "utils/error";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { useLocation, useNavigate } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/dist/query";

export default function Form(props: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [transactionIds, setTransactionIds] = useState<number[]>([]);
  const [flows, setFlows] = useState<Record<number, TransactionApiOut>>({});

  const transactionsQuery = api.endpoints.readManyApiTransactionsGet.useQuery(
    transactionIds.length ? { ids: transactionIds.join() } : skipToken
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const transactionIdsStr = params.get("transactionIds");
    if (!transactionIdsStr) return;

    setTransactionIds((prevTransactionIds) => [
      ...prevTransactionIds,
      ...transactionIdsStr.split(",").map(Number),
    ]);

    params.delete("transactionIds");
    navigate({ ...location, search: params.toString() }, { replace: true });
  }, [location, navigate]);

  useEffect(() => {
    if (!transactionsQuery.isSuccess) return;
    setFlows(
      transactionsQuery.data.reduce((acc, t) => ({ ...acc, [t.id]: t }), {})
    );
  }, [transactionsQuery.isSuccess, transactionsQuery.data]);

  const outflows = Object.values(flows).filter((t) => t.amount < 0);
  const inflows = Object.values(flows).filter((t) => t.amount >= 0);

  const [createMovement, createMovementResult] =
    api.endpoints.createApiMovementsPost.useMutation();

  function handleClose() {
    setFlows({});
    setTransactionIds([]);
    props.onClose();
  }

  async function handleSubmit() {
    // if (!outflows.length) return;
    // if (!inflows.length) return;
    try {
      await createMovement(Object.keys(flows).map(Number)).unwrap();
    } catch (error) {
      logMutationError(error, createMovementResult);
      return;
    }
    handleClose();
  }

  const handleMutation = (transaction: TransactionApiOut) => {
    const transactionIdsSet = new Set(transactionIds).add(transaction.id);
    setTransactionIds(Array.from(transactionIdsSet));
  };

  function handleRemoveFlow(transactionId: number) {
    const newTxIds = transactionIds.filter((id) => id !== transactionId);
    if (!newTxIds.length) setFlows([]);
    setTransactionIds(transactionIds.filter((id) => id !== transactionId));
  }

  return (
    <Modal open={props.open} onClose={handleClose} size="fullscreen">
      <Modal.Header>Create a Movement</Modal.Header>
      <Modal.Content>
        <div style={{ height: "70vh" }}>
          <FlexColumn>
            <Flows
              inflows={inflows}
              outflows={outflows}
              onRemove={handleRemoveFlow}
            />
            <QueryErrorMessage query={createMovementResult} />
            <FlexColumn.Auto>
              <ManagedTable
                relatedTransactions={Object.values(flows)}
                onMutation={handleMutation}
              />
            </FlexColumn.Auto>
          </FlexColumn>
        </div>
      </Modal.Content>
      <Modal.Actions>
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
