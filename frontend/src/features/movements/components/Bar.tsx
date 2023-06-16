import {
  Button,
  Icon,
  Input,
  InputOnChangeData,
  Menu,
} from "semantic-ui-react";

export function Bar(props: {
  onOpenCreateForm: () => void;
  search: string;
  onSearchChange: (x: string) => void;
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
    </Menu>
  );
}
