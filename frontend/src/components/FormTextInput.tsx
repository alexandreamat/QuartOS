import useFormField from "hooks/useFormField";
import { Form, InputOnChangeData } from "semantic-ui-react";
import { capitaliseFirstLetter } from "utils/string";

export default function FormTextInput(props: {
  label?: string;
  field: ReturnType<typeof useFormField<string>>;
  type?: string;
  readOnly?: boolean;
}) {
  const label = props.label || props.field.label;

  if (props.readOnly) {
    return (
      <Form.Field>
        <label>{label && capitaliseFirstLetter(label)}</label>
        {props.field.value}
      </Form.Field>
    );
  }

  return (
    <Form.Input
      type={props.type}
      label={label && capitaliseFirstLetter(label)}
      placeholder={label && "Enter " + label.toLocaleLowerCase()}
      required={!props.readOnly}
      value={props.field.value}
      onChange={(
        e: React.ChangeEvent<HTMLInputElement>,
        data: InputOnChangeData
      ) => {
        props.field.reset();
        props.field.set(data.value);
      }}
      error={props.field.isError}
    />
  );
}
