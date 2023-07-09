import {
  Button,
  Icon,
  Input,
  InputOnChangeData,
  Menu,
  MenuItem,
} from "semantic-ui-react";
import { dateToString, stringToDate } from "utils/time";
import { RemoveCircle } from "./RemoveCircle";

export function Bar(props: {
  onOpenCreateForm: () => void;
  search: string;
  onSearchChange: (x: string) => void;
  startDate?: Date;
  onStartDateChange: (x: Date | undefined) => void;
  endDate?: Date;
  onEndDateChange: (x: Date | undefined) => void;
  isDescending: boolean;
  onToggleIsDescending: () => void;
}) {
  return (
    <Menu secondary>
      <Menu.Item>
        <Button
          icon
          labelPosition="left"
          primary
          onClick={props.onOpenCreateForm}
        >
          Add
          <Icon name="plus" />
        </Button>
      </Menu.Item>
      <Menu.Item>
        <Input
          icon="search"
          placeholder="Search..."
          value={props.search}
          onChange={(
            event: React.ChangeEvent<HTMLInputElement>,
            data: InputOnChangeData
          ) => props.onSearchChange(data.value as string)}
        />
      </Menu.Item>
      <Menu.Menu>
        <MenuItem fitted>
          <Icon name="calendar" color="grey" />
        </MenuItem>
        <Menu.Item fitted>
          <Input
            label="from"
            type="date"
            value={props.startDate ? dateToString(props.startDate) : ""}
            onChange={(_: unknown, data: InputOnChangeData) =>
              props.onStartDateChange(stringToDate(data.value))
            }
          />
          {props.startDate && (
            <Menu.Item fitted>
              <RemoveCircle
                onClick={() => props.onStartDateChange(undefined)}
              />
            </Menu.Item>
          )}
        </Menu.Item>
        <Menu.Item fitted>
          <Input
            label="to"
            type="date"
            value={props.endDate ? dateToString(props.endDate) : ""}
            onChange={(_: unknown, data: InputOnChangeData) =>
              props.onEndDateChange(stringToDate(data.value))
            }
          />
          {props.endDate && (
            <Menu.Item fitted>
              <RemoveCircle onClick={() => props.onEndDateChange(undefined)} />
            </Menu.Item>
          )}
        </Menu.Item>
        <Menu.Item fitted>
          <Button icon onClick={props.onToggleIsDescending}>
            <Icon
              name={props.isDescending ? "sort amount down" : "sort amount up"}
            />
          </Button>
        </Menu.Item>
      </Menu.Menu>
    </Menu>
  );
}
