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

export default function MenuDropdown<T extends number | string>(props: {
  state: UseStateType<T | undefined>;
  options?: DropdownItemProps[];
  loading?: boolean;
  error?: boolean;
  placeholder?: string;
  icon?: SemanticICONS;
}) {
  const [value, setValue] = props.state;
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
          value={value}
          options={props.options}
          onChange={(_, data) => setValue(data.value as T)}
          loading={props.loading}
          error={props.error}
        />
      </Popup>
      {value !== undefined && (
        <Menu.Item fitted>
          <ClickableIcon
            name="remove circle"
            onClick={() => setValue(undefined)}
          />
        </Menu.Item>
      )}
    </Menu.Item>
  );
}
