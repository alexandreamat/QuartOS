// Copyright (C) 2023 Alexandre Amat
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
