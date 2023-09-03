import { Input } from "semantic-ui-react";

export default function DecimalInput(props: {
  amount?: number;
  onAmountChange: (x?: number) => void;
  placeholder: string;
  label: string;
}) {
  const amountGeStr = props.amount !== undefined ? props.amount : "";
  return (
    <Input
      label={props.label}
      placeholder={props.placeholder}
      type="number"
      input={{
        inputMode: "decimal",
        step: "0.01",
      }}
      value={amountGeStr}
      onChange={(_, data) => {
        if (data.value.length) {
          const newAmount = Number(data.value);
          if (isNaN(newAmount)) return;
          props.onAmountChange(newAmount);
        } else {
          props.onAmountChange(undefined);
        }
      }}
    />
  );
}
