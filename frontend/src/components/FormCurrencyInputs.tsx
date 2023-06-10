import useFormField from "hooks/useFormField";
import { Form, InputOnChangeData } from "semantic-ui-react";
import FormDropdownInput from "./FormDropdownInput";
import { codes } from "currency-codes";

const currencyCodeOptions = codes().map((code, index) => ({
  key: index,
  value: code,
  text: code,
}));

export default function FormCurrencyInputs(props: {
  label: string;
  amount: ReturnType<typeof useFormField<string>>;
  currency: ReturnType<typeof useFormField<string>>;
}) {
  return (
    <Form.Group widths="equal">
      <Form.Input
        type="number"
        input={{
          inputMode: "decimal",
          step: "0.01",
        }}
        label={props.label}
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
        error={props.amount.isError}
      />
      <FormDropdownInput
        field={props.currency}
        label="Currency"
        options={currencyCodeOptions}
        compact
      />
    </Form.Group>
  );
}
