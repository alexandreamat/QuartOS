import ActionButton from "./ActionButton";
import { SemanticFLOATS } from "semantic-ui-react";

export default function MutateActionButton(props: {
  onOpenEditForm: () => void;
  disabled?: boolean;
  negative?: boolean;
  loading?: boolean;
  floated?: SemanticFLOATS;
}) {
  return (
    <ActionButton
      floated={props.floated}
      tooltip="More"
      negative={props.negative}
      loading={props.loading}
      disabled={props.disabled}
      icon="ellipsis horizontal"
      onClick={() => props.onOpenEditForm()}
    />
  );
}
