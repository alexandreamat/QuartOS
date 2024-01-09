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

import { Input } from "semantic-ui-react";
import { UseStateType } from "types";

export default function NumericInput(props: {
  valueState: UseStateType<number | undefined>;
  placeholder: string;
  label: string;
  signed?: boolean;
  decimal?: boolean;
}) {
  const [value, setValue] = props.valueState;
  const valueStr = value !== undefined ? value : "";
  return (
    <Input
      label={props.label}
      placeholder={props.placeholder}
      type="number"
      input={{
        inputMode: props.decimal ? "decimal" : "numeric",
        step: props.decimal ? 0.01 : undefined,
        min: props.signed ? 0 : undefined,
      }}
      value={valueStr}
      onChange={(_, data) => {
        if (data.value.length) {
          const newValue = Number(data.value);
          if (isNaN(newValue)) return;
          setValue(newValue);
        } else {
          setValue(undefined);
        }
      }}
    />
  );
}
