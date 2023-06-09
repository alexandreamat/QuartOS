import useFormField from "hooks/useFormField";
import { SimpleQuery } from "interfaces";
import { Form, InputOnChangeData, Label } from "semantic-ui-react";
import { capitaliseFirstLetter } from "utils/string";
import CurrencyLabel from "./CurrencyLabel";

export default function FormCurrencyInput(props: {
  label?: string;
  field: ReturnType<typeof useFormField<string>>;
  currency: string;
  query?: SimpleQuery;
  readOnly?: boolean;
}) {
  const label = props.label || props.field.label;

  if (props.readOnly) {
    return (
      <Form.Field>
        <label>{label && capitaliseFirstLetter(label)}</label>
        <CurrencyLabel
          currencyCode={props.currency}
          amount={Number(props.field.value)}
        />
      </Form.Field>
    );
  }

  return (
    <Form.Input
      readOnly={props.readOnly}
      disabled={!props.query?.isSuccess}
      loading={props.query?.isLoading}
      type="number"
      placeholder={label && "Enter " + label}
      required
      value={props.field.value}
      onChange={(
        e: React.ChangeEvent<HTMLInputElement>,
        data: InputOnChangeData
      ) => {
        props.field.reset();
        props.field.set(data.value as string);
      }}
      labelPosition="left"
      error={props.field.isError || props.query?.isError}
    >
      <Label>{props.currency}</Label>
      <input inputMode="decimal" step="0.01" />
    </Form.Input>
  );
}
