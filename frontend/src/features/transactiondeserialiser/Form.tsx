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
  TransactionDeserialiserApiIn,
  TransactionDeserialiserApiOut,
  api,
} from "app/services/api";
import FormTextArea from "components/FormTextArea";
import FormTextInput from "components/FormTextInput";
import { FormValidationError } from "components/FormValidationError";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import useFormField from "hooks/useFormField";
import { useEffect } from "react";
import { Button, Form, FormCheckbox, Modal } from "semantic-ui-react";
import { logMutationError } from "utils/error";

export default function TransactionDeserialiserForm(props: {
  transactionDeserialiser?: TransactionDeserialiserApiOut;
  open: boolean;
  onClose: () => void;
}) {
  const skipRowsStr = useFormField("0");
  const columnsStr = useFormField("0");
  const ascendingTimestamp = useFormField(true);
  const delimiter = useFormField(",");
  const encoding = useFormField("utf-8");
  const moduleName = useFormField("");
  const name = useFormField("");
  const amount = useFormField("");
  const timestamp = useFormField("");

  const fields = [
    moduleName,
    skipRowsStr,
    ascendingTimestamp,
    columnsStr,
    delimiter,
    encoding,
    name,
    amount,
    timestamp,
  ];

  const [createTransactionDeserialiser, createTransactionDeserialiserResult] =
    api.endpoints.createTransactiondeserialisersPost.useMutation();
  const [updateTransactionDeserialiser, updateTransactionDeserialiserResult] =
    api.endpoints.updateTransactiondeserialisersIdPut.useMutation();

  useEffect(() => {
    if (!props.transactionDeserialiser) return;
    moduleName.set(props.transactionDeserialiser.module_name);
    skipRowsStr.set(props.transactionDeserialiser.skip_rows.toFixed(0));
    columnsStr.set(props.transactionDeserialiser.columns.toFixed(0));
    name.set(props.transactionDeserialiser.name_deserialiser);
    amount.set(props.transactionDeserialiser.amount_deserialiser);
    timestamp.set(props.transactionDeserialiser.timestamp_deserialiser);
    delimiter.set(props.transactionDeserialiser.delimiter);
    encoding.set(props.transactionDeserialiser.encoding);
  }, [props.transactionDeserialiser]);

  const handleClose = () => {
    fields.forEach((field) => field.reset());
    props.onClose();
  };

  const handleSubmit = async () => {
    const invalidFields = fields.filter((field) => !field.validate());
    if (invalidFields.length > 0) return;
    const transactionDeserialiser: TransactionDeserialiserApiIn = {
      module_name: moduleName.value!,
      skip_rows: Number(skipRowsStr.value!),
      ascending_timestamp: ascendingTimestamp.value!,
      columns: Number(columnsStr.value!),
      name_deserialiser: name.value!,
      amount_deserialiser: amount.value!,
      timestamp_deserialiser: timestamp.value!,
      delimiter: delimiter.value!,
      encoding: encoding.value!,
    };
    if (props.transactionDeserialiser) {
      try {
        await updateTransactionDeserialiser({
          id: props.transactionDeserialiser.id,
          transactionDeserialiserApiIn: transactionDeserialiser,
        }).unwrap();
      } catch (error) {
        logMutationError(error, updateTransactionDeserialiserResult);
        return;
      }
    } else {
      try {
        await createTransactionDeserialiser(transactionDeserialiser).unwrap();
      } catch (error) {
        logMutationError(error, createTransactionDeserialiserResult);
        return;
      }
    }
    handleClose();
  };

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Modal.Header>Add a Transaction Deserialiser</Modal.Header>
      <Modal.Content>
        <Form>
          <FormTextInput label="Module Name" field={moduleName} />
          <FormTextInput type="number" label="Skip Rows" field={skipRowsStr} />
          <FormTextInput type="number" label="Columns" field={columnsStr} />
          <FormCheckbox
            label="Transactions are sorted from old to recent"
            field={ascendingTimestamp}
          />
          <FormTextInput label="Delimiter" field={delimiter} />
          <FormTextInput label="Encoding" field={encoding} />
          <FormTextArea label="deserialise_name = lambda row:" field={name} />
          <FormTextArea
            label="deserialise_amount = lambda row:"
            field={amount}
          />
          <FormTextArea
            label="deserialise_timestamp = lambda row:"
            field={timestamp}
          />
          <FormValidationError fields={fields} />
          <QueryErrorMessage query={createTransactionDeserialiserResult} />
          <QueryErrorMessage query={updateTransactionDeserialiserResult} />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={props.onClose}>Cancel</Button>
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
