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

import { MovementApiOut, api } from "app/services/api";
import FlexColumn from "components/FlexColumn";
import TransactionBar, {
  useTransactionBarState,
} from "features/transaction/components/Bar";
import TransactionCards from "features/transaction/components/TransactionCards";
import { useCheckboxes } from "hooks/useCheckboxes";
import { useRef } from "react";
import { Button, Modal } from "semantic-ui-react";
import { logMutationError } from "utils/error";

export default function AddTransactionsModal(props: {
  onClose: () => void;
  movement: MovementApiOut;
}) {
  const initialTransactions = new Set(
    props.movement.transactions.map((t) => t.id),
  );

  const reference = useRef<HTMLDivElement | null>(null);

  const barState = useTransactionBarState();
  const checkboxes = useCheckboxes(initialTransactions, initialTransactions);

  const [addTransactions, addTransactionsResult] =
    api.endpoints.addTransactionsUsersMeMovementsMovementIdTransactionsPut.useMutation();

  // Refactor useCheckboxes so we don't need this hack
  const additions = [
    ...new Set(
      [...checkboxes.checked].filter((x) => !checkboxes.disabled.has(x)),
    ),
  ];

  async function handleSubmit() {
    try {
      await addTransactions({
        movementId: props.movement.id,
        body: [...additions],
      }).unwrap();
    } catch (error) {
      logMutationError(error, addTransactionsResult);
      return;
    }
    props.onClose();
  }

  return (
    <Modal size="large" onClose={props.onClose} open>
      <Modal.Header>Choose transactions to add to the movement</Modal.Header>
      <Modal.Header>
        <TransactionBar barState={barState} />
      </Modal.Header>
      <Modal.Content>
        <FlexColumn style={{ height: "calc(80vh - 10em)" }}>
          <FlexColumn.Auto reference={reference}>
            <TransactionCards
              barState={barState}
              checkboxes={checkboxes}
              isMultipleChoice
              reference={reference}
            />
          </FlexColumn.Auto>
        </FlexColumn>
      </Modal.Content>
      <Modal.Actions>
        <Button content="Cancel" onClick={props.onClose} />
        <Button
          disabled={additions.length < 1}
          content={`Add ${additions.length} ${
            additions.length === 1 ? "transaction" : "transactions"
          } to the movement`}
          labelPosition="right"
          icon="checkmark"
          onClick={handleSubmit}
          positive
        />
      </Modal.Actions>
    </Modal>
  );
}
