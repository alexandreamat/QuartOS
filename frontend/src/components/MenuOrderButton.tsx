import { Button, Icon, Menu } from "semantic-ui-react";

export default function MenuOrderButton(props: {
  isDescending: boolean;
  onIsDescendingToggle: () => void;
}) {
  return (
    <Menu.Item fitted>
      <Button icon onClick={props.onIsDescendingToggle}>
        <Icon
          name={props.isDescending ? "sort amount down" : "sort amount up"}
        />
      </Button>
    </Menu.Item>
  );
}
