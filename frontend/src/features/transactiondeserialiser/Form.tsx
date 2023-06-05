import { Button, Form, Message, Modal } from "semantic-ui-react";
import { useEffect } from "react";
import {
  TransactionDeserialiserApiIn,
  TransactionDeserialiserApiOut,
  api,
} from "app/services/api";
import { renderErrorMessage } from "utils/error";
import useFormField from "hooks/useFormField";
import FormTextArea from "components/FormTextArea";
import FormTextInput from "components/FormTextInput";

export default function TransactionDeserialiserForm(props: {
  transactionDeserialiser?: TransactionDeserialiserApiOut;
  open: boolean;
  onClose: () => void;
}) {
  const skipRowsStr = useFormField("0");
  const columnsStr = useFormField("0");
  const moduleName = useFormField("");
  const name = useFormField("");
  const amount = useFormField("");
  const datetime = useFormField("");
  const currencyCode = useFormField("");
  const paymentChannel = useFormField("");
  const code = useFormField("");

  const fields = [
    moduleName,
    skipRowsStr,
    columnsStr,
    name,
    amount,
    datetime,
    currencyCode,
    paymentChannel,
    code,
  ];

  const [createTransactionDeserialiser, createTransactionDeserialiserResult] =
    api.endpoints.createApiTransactionDeserialisersPost.useMutation();
  const [updateTransactionDeserialiser, updateTransactionDeserialiserResult] =
    api.endpoints.updateApiTransactionDeserialisersIdPut.useMutation();

  useEffect(() => {
    if (!props.transactionDeserialiser) return;
    moduleName.set(props.transactionDeserialiser.module_name);
    skipRowsStr.set(props.transactionDeserialiser.skip_rows.toFixed(0));
    columnsStr.set(props.transactionDeserialiser.columns.toFixed(0));
    name.set(props.transactionDeserialiser.name_deserialiser);
    amount.set(props.transactionDeserialiser.amount_deserialiser);
    datetime.set(props.transactionDeserialiser.datetime_deserialiser);
    currencyCode.set(props.transactionDeserialiser.currency_code_deserialiser);
    paymentChannel.set(
      props.transactionDeserialiser.payment_channel_deserialiser
    );
    code.set(props.transactionDeserialiser.code_deserialiser);
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
      columns: Number(columnsStr.value!),
      name_deserialiser: name.value!,
      amount_deserialiser: amount.value!,
      datetime_deserialiser: datetime.value!,
      currency_code_deserialiser: currencyCode.value!,
      payment_channel_deserialiser: paymentChannel.value!,
      code_deserialiser: code.value!,
    };
    if (props.transactionDeserialiser) {
      try {
        await updateTransactionDeserialiser({
          id: props.transactionDeserialiser.id,
          transactionDeserialiserApiIn: transactionDeserialiser,
        }).unwrap();
      } catch (error) {
        console.error(error);
        console.error(updateTransactionDeserialiserResult.error);
        return;
      }
    } else {
      try {
        await createTransactionDeserialiser(transactionDeserialiser).unwrap();
      } catch (error) {
        console.error(error);
        console.error(createTransactionDeserialiserResult.error);
        return;
      }
    }
    handleClose();
  };

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Modal.Header>Hola</Modal.Header>
      <Modal.Content>
        <Form>
          <FormTextInput label="Module Name" field={moduleName} />
          <FormTextInput type="number" label="Skip Rows" field={skipRowsStr} />
          <FormTextInput type="number" label="Columns" field={columnsStr} />
          <FormTextArea label="deserialise_name = lambda row:" field={name} />
          <FormTextArea
            label="deserialise_amount = lambda row:"
            field={amount}
          />
          <FormTextArea
            label="deserialise_datetime = lambda row:"
            field={datetime}
          />
          <FormTextArea
            label="deserialise_currency_code = lambda row:"
            field={currencyCode}
          />
          <FormTextArea
            label="deserialise_payment_channel = lambda row:"
            field={paymentChannel}
          />
          <FormTextArea label="deserialise_code = lambda row:" field={code} />
          {fields.some((field) => field.isError) && (
            <Message
              error
              header="Action Forbidden"
              content="All fields are required!"
            />
          )}
          {(createTransactionDeserialiserResult.isError ||
            updateTransactionDeserialiserResult.isError) && (
            <Message negative>
              <Message.Header>There's been an error</Message.Header>
              <p>
                {createTransactionDeserialiserResult.error &&
                  renderErrorMessage(createTransactionDeserialiserResult.error)}
              </p>
              <p>
                {updateTransactionDeserialiserResult.error &&
                  renderErrorMessage(updateTransactionDeserialiserResult.error)}
              </p>
            </Message>
          )}
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
