import useFormField from "hooks/useFormField";
import { Form } from "semantic-ui-react";
import { dateToString, stringToDate, timeToString } from "utils/time";

export default function FormDateTimeInput(props: {
  label?: string;
  field: ReturnType<typeof useFormField<Date>>;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const label = props.label || props.field.label;

  if (props.readOnly) {
    return (
      <Form.Group widths="equal">
        <Form.Field>
          <label>Date</label>
          {dateToString(props.field.value!)}
        </Form.Field>
        <Form.Field>
          <label>Time</label>
          {timeToString(props.field.value!)}
        </Form.Field>
      </Form.Group>
    );
  }

  return (
    <Form.Group widths="equal">
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
      <Form.Input
        disabled={props.disabled}
        type="time"
        name={label}
        label="Time"
        icon="calendar"
        placeholder={label && "Enter " + label}
        value={timeToString(props.field.value!)}
        iconPosition="left"
        onChange={(e: React.SyntheticEvent<HTMLElement>, data: any) => {
          const newTime = data.value;
          const [hours, minutes] = newTime.split(":");
          const updatedDatetime = new Date(props.field.value!);
          updatedDatetime.setHours(Number(hours));
          updatedDatetime.setMinutes(Number(minutes));
          props.field.set(updatedDatetime);
        }}
      />
    </Form.Group>
  );
}
