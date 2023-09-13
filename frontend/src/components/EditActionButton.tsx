import ActionButton from "./ActionButton";
import { SemanticFLOATS } from "semantic-ui-react";

export default function EditActionButton(props: {
  onOpenEditForm: () => void;
  disabled?: boolean;
  negative?: boolean;
  loading?: boolean;
  floated?: SemanticFLOATS;
}) {
  return (
    <ActionButton
      floated={props.floated}
      tooltip="Edit"
      loading={props.loading}
      negative={props.negative}
      disabled={props.disabled}
      icon="pencil"
      onClick={() => props.onOpenEditForm()}
    />
  );
}
