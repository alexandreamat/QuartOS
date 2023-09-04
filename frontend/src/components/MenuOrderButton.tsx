import { Button, Icon, Menu } from "semantic-ui-react";
import { UseStateType } from "types";

export default function MenuOrderButton(props: {
  isDescendingState: UseStateType<boolean>;
}) {
  const [isDescending, setIsDescending] = props.isDescendingState;
  return (
    <Menu.Item fitted>
      <Button icon onClick={() => setIsDescending((x) => !x)}>
        <Icon name={isDescending ? "sort amount down" : "sort amount up"} />
      </Button>
    </Menu.Item>
  );
}
