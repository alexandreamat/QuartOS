import { Input, InputOnChangeData, Menu } from "semantic-ui-react";
import { format } from "date-fns";
import { stringToDate } from "utils/time";
import { ClickableIcon } from "./ClickableIcon";

export default function MenuDateInput(props: {
  label: string;
  date?: Date;
  onDateChange: (x: Date | undefined) => void;
}) {
  const dateStr = props.date ? format(props.date, "yyyy-MM-dd") : "";
  return (
    <Menu.Item fitted>
      <Input
        label={props.label}
        type="date"
        value={dateStr}
        onChange={(_: unknown, data: InputOnChangeData) => {
          const newDate = stringToDate(data.value);
          if (isNaN(newDate.getTime())) return;
          props.onDateChange(newDate);
        }}
      />
      {props.date && (
        <Menu.Item fitted>
          <ClickableIcon
            name="remove circle"
            onClick={() => props.onDateChange(undefined)}
          />
        </Menu.Item>
      )}
    </Menu.Item>
  );
}
