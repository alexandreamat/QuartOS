import { Button, Input, Menu, Popup } from "semantic-ui-react";
import { format } from "date-fns";
import { stringToDate } from "utils/time";
import { ClickableIcon } from "./ClickableIcon";
import { UseStateType } from "types";

export default function MenuDateInput(props: {
  label: string;
  dateState: UseStateType<Date | undefined>;
}) {
  const [date, setDate] = props.dateState;
  const dateStr = date ? format(date, "yyyy-MM-dd") : "";
  return (
    <Menu.Item fitted>
      <Popup
        trigger={<Button icon="calendar" />}
        hoverable
        position="bottom right"
        on="click"
      >
        <Input
          label={props.label}
          type="date"
          value={dateStr}
          onChange={(_, data) => {
            const newDate = stringToDate(data.value);
            if (isNaN(newDate.getTime())) return;
            setDate(newDate);
          }}
        />
      </Popup>
      {date && (
        <Menu.Item fitted>
          <ClickableIcon
            name="remove circle"
            onClick={() => setDate(undefined)}
          />
        </Menu.Item>
      )}
    </Menu.Item>
  );
}
