import { Button, Input, Menu, Popup } from "semantic-ui-react";
import { format } from "date-fns";
import { stringToDate } from "utils/time";
import { ClickableIcon } from "./ClickableIcon";
import { UseStateType } from "types";
import { useEffect } from "react";

function MenuDateInput(props: {
  label: string;
  dateState: UseStateType<Date | undefined>;
}) {
  const [date, setDate] = props.dateState;
  const dateStr = date ? format(date, "yyyy-MM-dd") : "";
  return (
    <Menu.Item fitted>
      <Input
        style={{ display: "flex" }}
        label={{
          content: props.label,
          style: { width: "55px" },
        }}
        input={{ style: { flex: 1 } }}
        type="date"
        value={dateStr}
        onChange={(_, data) => {
          const newDate = stringToDate(data.value);
          if (isNaN(newDate.getTime())) return;
          setDate(newDate);
        }}
      />
    </Menu.Item>
  );
}

export default function MenuDateRange(props: {
  dateGeState: UseStateType<Date | undefined>;
  dateLeState: UseStateType<Date | undefined>;
  isDescendingState: UseStateType<boolean>;
}) {
  const [startDate, setStartDate] = props.dateGeState;
  const [endDate, setEndDate] = props.dateLeState;
  const [isDescending, setIsDescending] = props.isDescendingState;

  useEffect(() => {
    if ((startDate !== undefined) === (endDate !== undefined)) return; // XNOR

    if (startDate) setIsDescending(false);
    if (endDate) setIsDescending(true);
  }, [startDate, endDate, setIsDescending]);

  return (
    <Menu.Item fitted>
      <Popup
        trigger={<Button icon="calendar" />}
        hoverable
        position="bottom right"
        on="click"
      >
        <Menu secondary vertical>
          <MenuDateInput label="from" dateState={props.dateGeState} />
          <Menu.Item fitted>
            <Button
              fluid
              disabled={(startDate !== undefined) === (endDate !== undefined)} // NXOR
              icon="arrows alternate vertical"
              onClick={() => {
                setStartDate(endDate);
                setEndDate(startDate);
              }}
            />
          </Menu.Item>
          <MenuDateInput label="to" dateState={props.dateLeState} />
          <Menu.Item fitted>
            <Button
              toggle
              fluid
              disabled={(startDate !== undefined) !== (endDate !== undefined)} // XOR
              icon={isDescending ? "sort amount down" : "sort amount up"}
              active={isDescending}
              onClick={() => setIsDescending((x) => !x)}
            />
          </Menu.Item>
        </Menu>
      </Popup>
      {(startDate || endDate) && (
        <Menu.Item fitted>
          <ClickableIcon
            name="remove circle"
            onClick={() => {
              setStartDate(undefined);
              setEndDate(undefined);
            }}
          />
        </Menu.Item>
      )}
    </Menu.Item>
  );
}
