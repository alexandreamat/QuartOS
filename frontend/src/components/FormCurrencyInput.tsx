import useFormField from "hooks/useFormField";
import { Form, InputOnChangeData, Label } from "semantic-ui-react";

export default function FormCurrencyInput(props: {
  label: string;
  amount: ReturnType<typeof useFormField<string>>;
  currency: string;
}) {
  return (
    <Form.Input
      type="number"
      input={{
        inputMode: "decimal",
        step: "0.01",
      }}
      placeholder={"Enter " + props.label}
      required
      value={props.amount.value}
      onChange={(
        e: React.ChangeEvent<HTMLInputElement>,
        data: InputOnChangeData
      ) => {
        props.amount.reset();
        props.amount.set(data.value as string);
      }}
      labelPosition="left"
      error={props.amount.isError}
    >
      <Label>{props.currency}</Label>
      <input />
    </Form.Input>
  );
}
