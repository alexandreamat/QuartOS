import { Popup } from "semantic-ui-react";
import ActionButton from "./ActionButton";

export default function EditActionButton(props: {
  onOpenEditForm: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Popup
      content="Edit"
      trigger={
        <ActionButton
          loading={props.loading}
          disabled={props.disabled}
          icon="pencil"
          onClick={() => props.onOpenEditForm()}
        />
      }
    />
  );
}
