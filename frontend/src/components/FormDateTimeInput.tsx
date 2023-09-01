import useFormField from "hooks/useFormField";
import { Form } from "semantic-ui-react";
import { formatDateParam, stringToDate } from "utils/time";

export default function FormDateTimeInput(props: {
  label?: string;
  field: ReturnType<typeof useFormField<Date>>;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  if (props.readOnly) {
    return (
      <Form.Field>
        <label>Date</label>
        {props.field.value && props.field.value.toLocaleDateString()}
      </Form.Field>
    );
  }

  const label = props.label || props.field.label;
  const dateStr = props.field.value ? formatDateParam(props.field.value) : "";

  return (
    <Form.Input
      disabled={props.disabled}
      type="date"
      name={label}
      label="Date"
      icon="calendar"
      required
      placeholder={label && "Enter " + label}
      value={dateStr}
      iconPosition="left"
      onChange={(e: React.SyntheticEvent<HTMLElement>, data: any) => {
        const newDate = stringToDate(data.value);
        if (isNaN(newDate.getTime())) return;
        props.field.set(newDate);
      }}
    />
  );
}
