import { Input } from "semantic-ui-react";
import { UseStateType } from "types";

export default function DecimalInput(props: {
  amountState: UseStateType<number | undefined>;
  placeholder: string;
  label: string;
}) {
  const [amount, setAmount] = props.amountState;
  const amountGeStr = amount !== undefined ? amount : "";
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
          setAmount(newAmount);
        } else {
          setAmount(undefined);
        }
      }}
    />
  );
}
