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
