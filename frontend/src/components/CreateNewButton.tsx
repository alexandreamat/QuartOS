import { Button, Icon } from "semantic-ui-react";

export default function CreateNewButton(props: { onCreate: () => void }) {
  return (
    <Button
      floated="right"
      icon
      primary
      labelPosition="left"
      onClick={props.onCreate}
    >
      <Icon name="plus" /> Create New
    </Button>
  );
}
