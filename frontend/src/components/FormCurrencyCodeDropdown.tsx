import useFormField from "hooks/useFormField";
import FormDropdownInput from "./FormDropdownInput";
import { useCurrencyCodeOptions } from "hooks/useCurrencyCodeOptions";
import { Form } from "semantic-ui-react";

export default function FormCurrencyCodeDropdown(props: {
  readOnly?: boolean;
  currencyCode: ReturnType<typeof useFormField<string>>;
  label?: string;
}) {
  const currencyCodeOptions = useCurrencyCodeOptions();

  if (props.readOnly) {
    return (
      <Form.Field>
        {props.label && <label>{props.label}</label>}
        {props.currencyCode.value}
      </Form.Field>
    );
  }

  return (
    <FormDropdownInput
      field={props.currencyCode}
      label={props.label || "Currency"}
      options={currencyCodeOptions}
      compact
    />
  );
}
