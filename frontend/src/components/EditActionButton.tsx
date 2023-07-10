import { SimpleQuery } from "interfaces";
import ActionButton from "./ActionButton";
import { SemanticFLOATS } from "semantic-ui-react";

export default function EditActionButton(props: {
  onOpenEditForm: () => void;
  disabled?: boolean;
  query?: SimpleQuery;
  floated?: SemanticFLOATS;
}) {
  return (
    <ActionButton
      floated={props.floated}
      tooltip="Edit"
      query={props.query}
      disabled={props.disabled}
      icon="pencil"
      onClick={() => props.onOpenEditForm()}
    />
  );
}
