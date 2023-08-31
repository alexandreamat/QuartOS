import useFormField from "hooks/useFormField";
import { Form, InputOnChangeData } from "semantic-ui-react";
import FormCurrencyCodeDropdown from "./FormCurrencyCodeDropdown";

export default function FormCurrencyInputs(props: {
  label: string;
  amount: ReturnType<typeof useFormField<string>>;
  currencyCode: ReturnType<typeof useFormField<string>>;
}) {
  return (
    <Form.Group widths="equal">
      <FormCurrencyCodeDropdown currencyCode={props.currencyCode} />
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
    </Form.Group>
  );
}
