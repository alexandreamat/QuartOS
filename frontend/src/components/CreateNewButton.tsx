import { Button, Icon, SemanticFLOATS } from "semantic-ui-react";

export default function CreateNewButton(props: {
  onCreate: () => void;
  floated?: SemanticFLOATS;
  content?: string;
  compact?: boolean;
}) {
  return (
    <Button
      floated={props.floated || "right"}
      icon
      primary
      compact={props.compact}
      labelPosition="left"
      onClick={props.onCreate}
    >
      <Icon name="plus" /> {props.content || "Create New"}
    </Button>
  );
}

function CreateNewButtonPlaceholder(props: {
  floated?: SemanticFLOATS;
  content?: string;
  compact?: boolean;
}) {
  return (
    <Button
      floated={props.floated || "right"}
      icon
      primary
      compact={props.compact}
      labelPosition="left"
      disabled
      loading
    >
      <Icon name="plus" /> Create New
    </Button>
  );
}

CreateNewButton.Placeholder = CreateNewButtonPlaceholder;
