// Copyright (C) 2024 Alexandre Amat
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
