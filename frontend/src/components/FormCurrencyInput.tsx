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
import { Form, Label } from "semantic-ui-react";
import { capitaliseFirstLetter } from "utils/string";
import CurrencyLabel from "./CurrencyLabel";
import { BaseQueryFn } from "@reduxjs/toolkit/dist/query";
import { TypedUseQueryHookResult } from "@reduxjs/toolkit/dist/query/react";

export default function FormCurrencyInput<R, A, Q extends BaseQueryFn>(props: {
  label?: string;
  field: ReturnType<typeof useFormField<string>>;
  currency?: string;
  query?: TypedUseQueryHookResult<R, A, Q>;
  readOnly?: boolean;
}) {
  const label = props.label || props.field.label;

  if (props.readOnly) {
    return (
      <Form.Field>
        <label>{label && capitaliseFirstLetter(label)}</label>
        <CurrencyLabel
          currencyCode={props.currency}
          amount={Number(props.field.value)}
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
      value={props.field.value}
      onChange={(_, data) => {
        props.field.reset();
        props.field.set(data.value as string);
      }}
      labelPosition="left"
      error={props.field.isError || props.query?.isError}
    >
      <Label>{props.currency}</Label>
      <input inputMode="decimal" step="0.01" />
    </Form.Input>
  );
}
