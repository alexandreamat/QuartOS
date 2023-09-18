import { Label } from "semantic-ui-react";
import { FormattedCurrency } from "./FormattedCurrency";

export default function CurrencyLabel(props: {
  amount?: number;
  currencyCode?: string;
  loading?: boolean;
}) {
  return (
    <Label
      circular
      style={{ width: 100, textAlign: "center" }}
      color={
        props.amount && props.amount > 0
          ? "green"
          : props.amount && props.amount < 0
          ? "orange"
          : undefined
      }
    >
      {props.loading
        ? "..."
        : props.amount !== undefined &&
          props.currencyCode && (
            <FormattedCurrency
              amount={props.amount}
              currencyCode={props.currencyCode}
            />
          )}
    </Label>
  );
}
