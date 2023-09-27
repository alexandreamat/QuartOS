import useFormField from "hooks/useFormField";
import FormDropdownInput from "./FormDropdownInput";
import { useCurrencyCodeOptions } from "hooks/useCurrencyCodeOptions";
import { Form } from "semantic-ui-react";
import { capitaliseFirstLetter } from "utils/string";

export default function FormCurrencyCodeDropdown(props: {
  disabled?: boolean;
  currencyCode: ReturnType<typeof useFormField<string>>;
  label?: string;
}) {
  const currencyCodeOptions = useCurrencyCodeOptions();

  if (props.disabled) {
    return (
      <Form.Field>
        <label>{props.label && capitaliseFirstLetter(props.label)}</label>
        <p>{props.currencyCode.value}</p>
      </Form.Field>
    );
  }

  return (
    <FormDropdownInput
      disabled={props.disabled}
      field={props.currencyCode}
      label={props.label || "Currency"}
      options={currencyCodeOptions}
      compact
    />
  );
}
