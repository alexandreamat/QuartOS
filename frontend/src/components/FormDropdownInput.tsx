import useFormField from "hooks/useFormField";
import { SimpleQuery } from "interfaces";
import {
  DropdownItemProps,
  DropdownOnSearchChangeData,
  DropdownProps,
  Form,
} from "semantic-ui-react";
import { capitaliseFirstLetter } from "utils/string";

export default function FormDropdownInput<T extends number | string>(props: {
  label?: string;
  options: DropdownItemProps[];
  field: ReturnType<typeof useFormField<T>>;
  query?: SimpleQuery;
  compact?: boolean;
  optional?: boolean;
  disabled?: boolean;
  onSearchChange?: (s: string) => void;
}) {
  const label = props.label || props.field.label;
  return (
    <Form.Select
      disabled={props.disabled}
      label={label && capitaliseFirstLetter(label)}
      placeholder={label && (props.compact ? "Select" : "Select " + label)}
      search
      selection
      required={!props.optional}
      value={props.field.value}
      options={props.options}
      onChange={(e: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
        props.field.reset();
        props.field.set(data.value as T);
      }}
      loading={props.query?.isLoading}
      error={props.query?.isError || props.field.isError}
      compact={props.compact}
      onSearchChange={(
        event: React.SyntheticEvent<HTMLElement>,
        data: DropdownOnSearchChangeData
      ) => props.onSearchChange && props.onSearchChange(data.searchQuery)}
    />
  );
}
