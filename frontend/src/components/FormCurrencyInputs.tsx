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
import { Form, InputOnChangeData } from "semantic-ui-react";
import FormCurrencyCodeDropdown from "./FormCurrencyCodeDropdown";

export default function FormCurrencyInputs(props: {
  label: string;
  amount: ReturnType<typeof useFormField<string>>;
  currencyCode: ReturnType<typeof useFormField<string>>;
}) {
  return (
    <Form.Group widths="equal">
      <FormCurrencyCodeDropdown currencyCode={props.currencyCode} />
      <Form.Input
        type="number"
        input={{
          inputMode: "decimal",
          step: "0.01",
        }}
        label={props.label}
        placeholder={"Enter " + props.label}
        required
        value={props.amount.value}
        onChange={(
          e: React.ChangeEvent<HTMLInputElement>,
          data: InputOnChangeData,
        ) => {
          props.amount.reset();
          props.amount.set(data.value as string);
        }}
        error={props.amount.isError}
      />
    </Form.Group>
  );
}
