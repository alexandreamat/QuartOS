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
