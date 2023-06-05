import useFormField from "hooks/useFormField";
import { Form, InputOnChangeData } from "semantic-ui-react";

export default function FormTextInput(props: {
  label: string;
  field: ReturnType<typeof useFormField<string>>;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <Form.Input
      readOnly={props.readOnly}
      type={props.type}
      label={props.label}
      placeholder={"Enter " + props.label.toLocaleLowerCase()}
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
