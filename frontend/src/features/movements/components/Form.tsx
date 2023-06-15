import { Flows } from "./Flows";
import { useState } from "react";
import ManagedTable from "features/transaction/components/ManagedTable";
import { Button, Modal } from "semantic-ui-react";
import FlexColumn from "components/FlexColumn";
import { TransactionApiOut, api } from "app/services/api";
import { logMutationError } from "utils/error";
import { QueryErrorMessage } from "components/QueryErrorMessage";

export default function Form(props: { open: boolean; onClose: () => void }) {
  const [flows, setFlows] = useState<Record<number, TransactionApiOut>>({});

  const outflows = Object.values(flows).filter((t) => t.amount < 0);
  const inflows = Object.values(flows).filter((t) => t.amount >= 0);

  const [createMovement, createMovementResult] =
    api.endpoints.createApiMovementsPost.useMutation();

  function handleTransactionCheckedChange(
    transaction: TransactionApiOut,
    checked: boolean
  ) {
    setFlows((prevFlows) => {
      if (checked) return { ...prevFlows, [transaction.id]: transaction };
      const { [transaction.id]: _, ...remaining } = prevFlows;
      return remaining;
    });
  }

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

  return (
    <Modal open={props.open} onClose={handleClose} size="fullscreen">
      <Modal.Header>Create a Movement</Modal.Header>
      <Modal.Content>
        <div style={{ height: "70vh" }}>
          <FlexColumn>
            <Flows inflows={inflows} outflows={outflows} />
            <QueryErrorMessage query={createMovementResult} />
            <FlexColumn.Auto>
              <ManagedTable
                onTransactionCheckedChange={handleTransactionCheckedChange}
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
