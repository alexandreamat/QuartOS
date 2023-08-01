import useFormField from "hooks/useFormField";
import { Form } from "semantic-ui-react";
import { dateToString, stringToDate } from "utils/time";

export default function FormDateTimeInput(props: {
  label?: string;
  field: ReturnType<typeof useFormField<Date>>;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const label = props.label || props.field.label;

  if (props.readOnly) {
    return (
      <Form.Field>
        <label>Date</label>
        {dateToString(props.field.value!)}
      </Form.Field>
    );
  }

  return (
    <Form.Input
      disabled={props.disabled}
      type="date"
      name={label}
      label="Date"
      icon="calendar"
      required
      placeholder={label && "Enter " + label}
      value={dateToString(props.field.value!)}
      iconPosition="left"
      onChange={(e: React.SyntheticEvent<HTMLElement>, data: any) => {
        const updatedDatetime = stringToDate(data.value, props.field.value);
        props.field.set(updatedDatetime);
      }}
    />
  );
}
