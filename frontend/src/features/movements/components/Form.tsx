import { Flows } from "./Flows";
import { useEffect, useState } from "react";
import TransactionsManagedTable from "features/transaction/components/ManagedTable";
import { Button, Modal } from "semantic-ui-react";
import FlexColumn from "components/FlexColumn";
import { MovementApiOut, TransactionApiOut, api } from "app/services/api";
import { logMutationError } from "utils/error";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { useLocation, useNavigate } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { SimpleQuery } from "interfaces";
import ConfirmDeleteButtonModal from "components/ConfirmDeleteButtonModal";

const Form = (props: {
  onClose: () => void;
  onSubmit: (x: TransactionApiOut[]) => Promise<void>;
  editQuery: SimpleQuery;
  flows: Record<number, TransactionApiOut>;
  onDelete?: () => Promise<void>;
  deleteQuery?: SimpleQuery;
}) => {
  const [flows, setFlows] = useState(props.flows);

  const outflows = Object.values(flows).filter((f) => f.amount < 0);
  const inflows = Object.values(flows).filter((f) => f.amount >= 0);

  useEffect(() => setFlows(props.flows), [props.flows]);

  function handleClose() {
    setFlows({});
    props.onClose();
  }

  function handleAddFlow(transaction: TransactionApiOut) {
    setFlows((prevFlows) => ({ [transaction.id]: transaction, ...prevFlows }));
  }

  function handleRemoveFlow(transaction: TransactionApiOut) {
    setFlows((prevFlows) => {
      const { [transaction.id]: _, ...remaining } = prevFlows;
      return remaining;
    });
  }

  function handleFlowCheckboxChange(
    transaction: TransactionApiOut,
    checked: boolean
  ) {
    if (checked) handleAddFlow(transaction);
    else handleRemoveFlow(transaction);
  }

  return (
    <Modal open={true} onClose={handleClose} size="fullscreen">
      <Modal.Header>Create a Movement</Modal.Header>
      <Modal.Content>
        <div style={{ height: "70vh" }}>
          <FlexColumn>
            <Flows
              inflows={inflows}
              outflows={outflows}
              onRemove={handleRemoveFlow}
            />
            <QueryErrorMessage query={props.editQuery} />
            <FlexColumn.Auto>
              <TransactionsManagedTable
                relatedTransactions={Object.values(flows)}
                onMutation={handleAddFlow}
                onFlowCheckboxChange={handleFlowCheckboxChange}
                checked={Object.keys(flows).map(Number)}
              />
            </FlexColumn.Auto>
          </FlexColumn>
        </div>
      </Modal.Content>
      <Modal.Actions>
        {props.deleteQuery && props.onDelete && (
          <ConfirmDeleteButtonModal
            onDelete={props.onDelete!}
            query={props.deleteQuery}
          />
        )}
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          content="Save"
          type="submit"
          labelPosition="right"
          icon="checkmark"
          onClick={async () => await props.onSubmit(Object.values(flows))}
          positive
        />
      </Modal.Actions>
    </Modal>
  );
};

const FormCreate = (props: { onClose: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [transactionId, setTransactionId] = useState(0);
  const [flow, setFlow] = useState<TransactionApiOut | undefined>();

  const transactionQuery = api.endpoints.readApiTransactionsIdGet.useQuery(
    transactionId || skipToken
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const transactionIdParam = params.get("transactionId");
    if (!transactionIdParam) return;

    setTransactionId(Number(transactionIdParam));

    params.delete("transactionId");
    navigate({ ...location, search: params.toString() }, { replace: true });
  }, [location, navigate]);

  useEffect(() => {
    if (transactionQuery.isSuccess) setFlow(transactionQuery.data);
  }, [transactionQuery.isSuccess, transactionQuery.data]);

  const [createMovement, createMovementResult] =
    api.endpoints.createApiMovementsPost.useMutation();

  function handleClose() {
    setFlow(undefined);
    setTransactionId(0);
    props.onClose();
  }

  async function handleSubmit(flows: TransactionApiOut[]) {
    // if (!outflows.length) return;
    // if (!inflows.length) return;
    try {
      await createMovement(flows.map((f) => f.id)).unwrap();
    } catch (error) {
      logMutationError(error, createMovementResult);
      return;
    }
    handleClose();
  }

  return (
    <Form
      onClose={handleClose}
      onSubmit={handleSubmit}
      editQuery={createMovementResult}
      flows={flow ? { [flow.id]: flow } : {}}
    />
  );
};

const FormEdit = (props: { onClose: () => void; movement: MovementApiOut }) => {
  const transactionsQuery =
    api.endpoints.readTransactionsApiMovementsIdTransactionsGet.useQuery(
      props.movement.id
    );

  const flows = transactionsQuery.isSuccess
    ? Object.fromEntries(transactionsQuery.data.map((t) => [t.id, t]))
    : {};

  const [editMovement, editMovementResult] =
    api.endpoints.updateApiMovementsIdPatch.useMutation();

  const [deleteMovement, deleteMovementResult] =
    api.endpoints.deleteApiMovementsIdDelete.useMutation();

  async function handleSubmit(flows: TransactionApiOut[]) {
    // if (!outflows.length) return;
    // if (!inflows.length) return;
    try {
      await editMovement({
        id: props.movement.id,
        body: flows.map((f) => f.id),
      }).unwrap();
    } catch (error) {
      logMutationError(error, editMovementResult);
      return;
    }
    props.onClose();
  }

  const handleDelete = async () => {
    try {
      await deleteMovement(props.movement.id).unwrap();
    } catch (error) {
      logMutationError(error, deleteMovementResult);
      return;
    }
    props.onClose();
  };

  return (
    <Form
      onClose={props.onClose}
      flows={flows}
      onSubmit={handleSubmit}
      editQuery={editMovementResult}
      deleteQuery={deleteMovementResult}
      onDelete={handleDelete}
    />
  );
};

Form.Create = FormCreate;
Form.Edit = FormEdit;

export default Form;
