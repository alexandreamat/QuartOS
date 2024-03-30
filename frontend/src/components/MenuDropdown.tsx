import ClickableIcon from "components/ClickableIcon";
import {
  Button,
  Dropdown,
  DropdownItemProps,
  Menu,
  Popup,
  SemanticICONS,
} from "semantic-ui-react";
import { UseStateType } from "types";

export default function MenuDropdown<T extends number | string>(
  props: {
    options?: DropdownItemProps[];
    loading?: boolean;
    error?: boolean;
    placeholder?: string;
    icon?: SemanticICONS;
  } & (
    | {
        state: UseStateType<T>;
        required: true;
      }
    | {
        state: UseStateType<T | undefined>;
        required?: false;
      }
  ),
) {
  return (
    <Menu.Item fitted>
      <Popup
        trigger={<Button icon={props.icon || "filter"} />}
        hoverable
        position="bottom right"
        on="click"
      >
        <Dropdown
          button
          placeholder={props.placeholder}
          search
          selection
          value={props.state[0]}
          options={props.options}
          onChange={(_, data) => props.state[1](data.value as T)}
          loading={props.loading}
          error={props.error}
        />
      </Popup>
      {!props.required && props.state[0] !== undefined && (
        <Menu.Item fitted>
          <ClickableIcon
            name="remove circle"
            onClick={() => props.state[1](undefined)}
          />
        </Menu.Item>
      )}
    </Menu.Item>
  );
}
