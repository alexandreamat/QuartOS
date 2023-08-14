import { Label, Loader } from "semantic-ui-react";
import { FormattedCurrency } from "./FormattedCurrency";

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
      <FormattedCurrency {...props} />
    </Label>
  );
}

function CurrencyLabelPlaceholder() {
  return (
    <Label circular style={{ width: 100, textAlign: "center" }} basic>
      <Loader active inline size="mini" />
    </Label>
  );
}

CurrencyLabel.Placeholder = CurrencyLabelPlaceholder;
