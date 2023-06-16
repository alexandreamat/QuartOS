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

  const params = new URLSearchParams(location.search);
  const transactionIdsStrParam = params.get("transactionIds");

  const [transactionIdsStr, setTransactionIdsStr] = useState("");
  const [flows, setFlows] = useState<Record<number, TransactionApiOut>>({});

  const transactionsQuery = api.endpoints.readManyApiTransactionsGet.useQuery(
    transactionIdsStr ? { ids: transactionIdsStr } : skipToken
  );

  useEffect(() => {
    if (transactionIdsStrParam) {
      setTransactionIdsStr(transactionIdsStrParam);
    } else {
      setTransactionIdsStr("");
      setFlows({});
    }
  }, [transactionIdsStrParam]);

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
    props.onClose();
  }

  async function handleSubmit() {
    if (!outflows.length) return;
    if (!inflows.length) return;
    try {
      await createMovement(Object.keys(flows).map(Number)).unwrap();
    } catch (error) {
      logMutationError(error, createMovementResult);
      return;
    }
    props.onClose();
  }

  function handleRemoveFlow(transactionId: number) {
    var transactionIds = params.get("transactionIds")?.split(",").map(Number);
    if (!transactionIds) return;

    transactionIds = transactionIds.filter((id) => id !== transactionId);
    if (transactionIds.length === 0) {
      navigate("/movements/?isFormOpen=true");
      return;
    }

    const param = transactionIds.join(",");
    navigate(`/movements/?isFormOpen=true&transactionIds=${param}`);
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
              onRemoveFlow={handleRemoveFlow}
            />
            <QueryErrorMessage query={createMovementResult} />
            <FlexColumn.Auto>
              <ManagedTable />
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
