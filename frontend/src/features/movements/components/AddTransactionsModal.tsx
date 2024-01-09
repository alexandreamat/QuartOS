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

import React, { useRef } from "react";
import { useTransactionBarState } from "features/transaction/components/Bar";
import { Button, Modal } from "semantic-ui-react";
import { api } from "app/services/api";
import { logMutationError } from "utils/error";
import TransactionBar from "features/transaction/components/Bar";
import TransactionCards from "features/transaction/components/TransactionCards";
import { useCheckboxes } from "hooks/useCheckboxes";
import FlexColumn from "components/FlexColumn";

export default function AddTransactionsModal(props: {
  onClose: () => void;
  movementId?: number;
}) {
  const reference = useRef<HTMLDivElement | null>(null);

  const barState = useTransactionBarState();
  const checkboxes = useCheckboxes();

  const [addTransactions, addTransactionsResult] =
    api.endpoints.addTransactionsApiUsersMeMovementsMovementIdTransactionsPut.useMutation();

  async function handleSubmit() {
    if (props.movementId) {
      try {
        await addTransactions({
          movementId: props.movementId,
          body: [...checkboxes.checked],
        }).unwrap();
      } catch (error) {
        logMutationError(error, addTransactionsResult);
        return;
      }
    } else {
      // create one movement from many transactions
    }
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
          disabled={checkboxes.checked.size < 1}
          content={`Add ${checkboxes.checked.size} ${
            checkboxes.checked.size === 1 ? "transaction" : "transactions"
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
