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
import FormDropdownInput from "./FormDropdownInput";
import { useCurrencyCodeOptions } from "hooks/useCurrencyCodeOptions";
import { Form } from "semantic-ui-react";
import { capitaliseFirstLetter } from "utils/string";

export default function FormCurrencyCodeDropdown(props: {
  disabled?: boolean;
  currencyCode: ReturnType<typeof useFormField<string>>;
  label?: string;
}) {
  const currencyCodeOptions = useCurrencyCodeOptions();

  if (props.disabled) {
    return (
      <Form.Field>
        <label>{props.label && capitaliseFirstLetter(props.label)}</label>
        <p>{props.currencyCode.value}</p>
      </Form.Field>
    );
  }

  return (
    <FormDropdownInput
      disabled={props.disabled}
      field={props.currencyCode}
      label={props.label || "Currency"}
      options={currencyCodeOptions}
      compact
    />
  );
}
