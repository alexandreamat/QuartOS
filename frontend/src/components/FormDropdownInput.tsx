import { BaseQueryFn } from "@reduxjs/toolkit/dist/query";
import { TypedUseQueryHookResult } from "@reduxjs/toolkit/dist/query/react";
import useFormField from "hooks/useFormField";
import { DropdownItemProps, DropdownProps, Form } from "semantic-ui-react";
import { capitaliseFirstLetter } from "utils/string";

export default function FormDropdownInput<
  T extends number | string,
  R,
  A,
  Q extends BaseQueryFn,
>(props: {
  label?: string;
  options: DropdownItemProps[];
  field: ReturnType<typeof useFormField<T>>;
  query?: TypedUseQueryHookResult<R, A, Q>;
  compact?: boolean;
  optional?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  onSearchChange?: (s: string) => void;
}) {
  const label = props.label || props.field.label;

  if (props.readOnly) {
    const selectedOption = props.options.find(
      (o) => o.value === props.field.value,
    );
    return (
      <Form.Field>
        <label>{label && capitaliseFirstLetter(label)}</label>
        {selectedOption ? selectedOption.text : null}
      </Form.Field>
    );
  }

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
      onSearchChange={(_, data) =>
        props.onSearchChange && props.onSearchChange(data.searchQuery)
      }
    />
  );
}
