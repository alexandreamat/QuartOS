import { Message } from "semantic-ui-react";

export function FormValidationError(props: { fields: { isError: boolean }[] }) {
  if (!props.fields.some((field) => field.isError)) return <></>;

  return (
    <Message
      error
      header="Action Forbidden"
      content="All fields are required!"
    />
  );
}
