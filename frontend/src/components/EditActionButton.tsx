import { SimpleQuery } from "interfaces";
import ActionButton from "./ActionButton";

export default function EditActionButton(props: {
  onOpenEditForm: () => void;
  disabled?: boolean;
  query?: SimpleQuery;
}) {
  return (
    <ActionButton
      tooltip="Edit"
      query={props.query}
      disabled={props.disabled}
      icon="pencil"
      onClick={() => props.onOpenEditForm()}
    />
  );
}
