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
import { Form, Label } from "semantic-ui-react";
import { capitaliseFirstLetter } from "utils/string";
import CurrencyLabel from "./CurrencyLabel";
import { useEffect, useState } from "react";

export default function FormCurrencyInput<R, A, Q extends BaseQueryFn>(props: {
  label?: string;
  field: ReturnType<typeof useFormField<number>>;
  currency?: string;
  query?: TypedUseQueryHookResult<R, A, Q>;
  readOnly?: boolean;
}) {
  const label = props.label || props.field.label;

  const [valueStr, setValueStr] = useState(props.field.value?.toFixed(2) || "");

  useEffect(() => props.field.set(Number(valueStr)), [valueStr]);

  if (props.readOnly) {
    return (
      <Form.Field>
        <label>{label && capitaliseFirstLetter(label)}</label>
        <CurrencyLabel
          currencyCode={props.currency}
          amount={props.field.value}
          loading={props.query?.isLoading}
        />
      </Form.Field>
    );
  }

  return (
    <Form.Input
      readOnly={props.readOnly}
      disabled={!props.query?.isSuccess}
      loading={props.query?.isLoading}
      type="number"
      placeholder={label && "Enter " + label}
      required
      value={valueStr}
      onChange={(e, { value }) => setValueStr(value)}
      labelPosition="left"
      error={props.field.isError || props.query?.isError}
    >
      <Label>{props.currency}</Label>
      <input inputMode="decimal" step="0.01" />
    </Form.Input>
  );
}
