import { SimpleQuery } from "interfaces";
import ActionButton from "./ActionButton";
import { SemanticFLOATS } from "semantic-ui-react";

export default function MutateActionButton(props: {
  onOpenEditForm: () => void;
  disabled?: boolean;
  query?: SimpleQuery;
  floated?: SemanticFLOATS;
}) {
  return (
    <ActionButton
      floated={props.floated}
      tooltip="More"
      query={props.query}
      disabled={props.disabled}
      icon="ellipsis horizontal"
      onClick={() => props.onOpenEditForm()}
    />
  );
}
