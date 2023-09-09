import { Button, Menu } from "semantic-ui-react";
import { UseStateType } from "types";

export default function MenuCheckbox(props: {
  isMultipleChoiceState: UseStateType<boolean>;
}) {
  const [isMultipleChoice, setIsMultipleChoice] = props.isMultipleChoiceState;
  return (
    <Menu.Item fitted>
      <Button
        icon="check square"
        toggle
        active={isMultipleChoice}
        onClick={() => setIsMultipleChoice((x) => !x)}
      />
    </Menu.Item>
  );
}
