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

import useFormField from "hooks/useFormField";
import { Form, InputOnChangeData, SemanticICONS } from "semantic-ui-react";
import { capitaliseFirstLetter } from "utils/string";

export default function FormTextInput(props: {
  label?: string;
  field: ReturnType<typeof useFormField<string>>;
  type?: string;
  readOnly?: boolean;
  icon?: SemanticICONS;
}) {
  const label = props.label || props.field.label;

  if (props.readOnly) {
    return (
      <Form.Field>
        <label>{label && capitaliseFirstLetter(label)}</label>
        {props.field.value}
      </Form.Field>
    );
  }

  return (
    <Form.Input
      icon={props.icon}
      type={props.type}
      label={label && capitaliseFirstLetter(label)}
      placeholder={label && "Enter " + label.toLocaleLowerCase()}
      required={!props.readOnly}
      value={props.field.value}
      onChange={(
        e: React.ChangeEvent<HTMLInputElement>,
        data: InputOnChangeData,
      ) => {
        props.field.reset();
        props.field.set(data.value);
      }}
      error={props.field.isError}
    />
  );
}
