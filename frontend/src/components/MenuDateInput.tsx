// Copyright (C) 2024 Alexandre Amat
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Button, Input, Menu, Popup } from "semantic-ui-react";
import { format } from "date-fns";
import ClickableIcon from "./ClickableIcon";
import { UseStateType } from "types";
import { useEffect, useState } from "react";

function MenuDateInput(props: {
  label: string;
  dateState: UseStateType<Date | undefined>;
  error?: boolean;
}) {
  const [date, setDate] = props.dateState;

  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const newDateStr = date ? format(date, "yyyy-MM-dd") : "";
    if (newDateStr === dateStr) return;
    setDateStr(newDateStr);
  }, [date]);

  useEffect(() => {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (year < 1900) return;
    const newDate = new Date(year, month - 1, day);
    if (isNaN(newDate.getTime())) return;
    if (newDate === date) return;
    setDate(newDate);
  }, [dateStr, setDate]);

  return (
    <Menu.Item fitted>
      <Input
        error={props.error}
        style={{ display: "flex" }}
        label={{
          content: props.label,
          style: { width: "55px" },
        }}
        input={{ style: { flex: 1 } }}
        type="date"
        value={dateStr}
        onChange={(_, data) => setDateStr(data.value)}
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

  const error = startDate && endDate && startDate > endDate;

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
          <MenuDateInput
            label="From"
            dateState={props.dateGeState}
            error={error}
          />
          <Menu.Item fitted>
            <Button
              fluid
              disabled={!startDate && !endDate}
              icon="arrows alternate vertical"
              onClick={() => {
                setStartDate(endDate);
                setEndDate(startDate);
              }}
            />
          </Menu.Item>
          <MenuDateInput
            label="To"
            dateState={props.dateLeState}
            error={error}
          />
          <Menu.Item fitted>
            <Button
              toggle
              fluid
              disabled={(startDate !== undefined) !== (endDate !== undefined)} // XOR
              icon={isDescending ? "sort amount up" : "sort amount down"}
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
