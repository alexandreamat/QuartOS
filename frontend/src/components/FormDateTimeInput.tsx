import useFormField from "hooks/useFormField";
import { Form } from "semantic-ui-react";

export default function FormDateTimeInput(props: {
  label: string;
  field: ReturnType<typeof useFormField<Date>>;
  disabled?: boolean;
}) {
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <Form.Group widths="equal">
      <Form.Input
        disabled={props.disabled}
        type="date"
        name={props.label}
        label="Date"
        icon="calendar"
        required
        placeholder={"Enter " + props.label}
        value={formatDate(props.field.value!)}
        iconPosition="left"
        onChange={(e: React.SyntheticEvent<HTMLElement>, data: any) => {
          const newDate = data.value;
          const [year, month, day] = newDate.split("-");
          const updatedDatetime = new Date(props.field.value!);
          updatedDatetime.setFullYear(Number(year));
          updatedDatetime.setMonth(Number(month) - 1);
          updatedDatetime.setDate(Number(day));
          props.field.set(updatedDatetime);
        }}
      />
      <Form.Input
        disabled={props.disabled}
        type="time"
        name={props.label}
        label="Time"
        icon="calendar"
        placeholder={"Enter " + props.label}
        value={formatTime(props.field.value!)}
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
