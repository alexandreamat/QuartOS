import { Label } from "semantic-ui-react";

export default function CurrencyLabel(props: {
  amount: number;
  currencyCode: string;
}) {
  return (
    <Label
      circular
      style={{ width: 100, textAlign: "center" }}
      color={props.amount > 0 ? "green" : props.amount < 0 ? "orange" : "grey"}
    >
      {props.amount.toLocaleString(undefined, {
        style: "currency",
        currency: props.currencyCode,
      })}
    </Label>
  );
}
