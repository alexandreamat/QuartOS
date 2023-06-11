import useFormField from "hooks/useFormField";
import { SimpleQuery } from "interfaces";
import { Form, InputOnChangeData, Label } from "semantic-ui-react";

export default function FormCurrencyInput(props: {
  label: string;
  amount: ReturnType<typeof useFormField<string>>;
  currency: string;
  query?: SimpleQuery;
}) {
  return (
    <Form.Input
      disabled={!props.query?.isSuccess}
      loading={props.query?.isLoading}
      type="number"
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
      error={props.amount.isError || props.query?.isError}
    >
      <Label>{props.currency}</Label>
      <input inputMode="decimal" step="0.01" />
    </Form.Input>
  );
}
