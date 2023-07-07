import ActionButton from "./ActionButton";

export default function EditActionButton(props: {
  onOpenEditForm: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <ActionButton
      tooltip="Edit"
      loading={props.loading}
      disabled={props.disabled}
      icon="pencil"
      onClick={() => props.onOpenEditForm()}
    />
  );
}
