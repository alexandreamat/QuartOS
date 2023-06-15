import { Button, Icon, Menu } from "semantic-ui-react";

export function Bar(props: { onOpenCreateForm: () => void }) {
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
    </Menu>
  );
}
