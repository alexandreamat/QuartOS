import { Button, Icon, SemanticFLOATS } from "semantic-ui-react";

export default function CreateNewButton(props: {
  onCreate: () => void;
  floated?: SemanticFLOATS;
  content?: string;
  compact?: boolean;
  loading?: boolean;
}) {
  return (
    <Button
      floated={props.floated || "right"}
      icon
      primary
      loading={props.loading}
      compact={props.compact}
      labelPosition="left"
      onClick={props.onCreate}
    >
      <Icon name="plus" /> {props.content || "Create New"}
    </Button>
  );
}
