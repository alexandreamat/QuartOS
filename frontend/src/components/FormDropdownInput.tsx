import useFormField from "hooks/useFormField";
import { DropdownItemProps, DropdownProps, Form } from "semantic-ui-react";

export default function FormDropdownInput<T extends number | string>(props: {
  label: string;
  options: DropdownItemProps[];
  field: ReturnType<typeof useFormField<T>>;
  loading?: boolean;
  error?: boolean;
  compact?: boolean;
  optional?: boolean;
}) {
  return (
    <Form.Select
      label={props.label}
      placeholder={
        props.compact ? "Select" : "Select " + props.label.toLocaleLowerCase()
      }
      search
      selection
      required={!props.optional}
      value={props.field.value}
      options={props.options}
      onChange={(e: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
        props.field.reset();
        props.field.set(data.value as T);
      }}
      loading={props.loading}
      error={props.error || props.field.isError}
      compact={props.compact}
    />
  );
}
