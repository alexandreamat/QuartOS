import { Message } from "semantic-ui-react";
import { UserApiOut } from "app/services/api";
import FormModal from "components/FormModal";
import useFormField from "hooks/useFormField";
import { useEffect } from "react";
import FormTextInput from "components/FormTextInput";

export default function UserForm(props: {
  user?: UserApiOut;
  open: boolean;
  onClose: () => void;
}) {
  const fullName = useFormField("");
  const email = useFormField("");

  useEffect(() => {
    if (!props.user) return;
    fullName.set(props.user.full_name);
    email.set(props.user.email);
  }, [props.user]);

  const handleClose = () => {
    fullName.reset();
    email.reset();
    props.onClose();
  };

  const handleSubmit = async () => {
    fullName.validate();
    email.validate();
    if (!fullName.validate() || !email.validate()) return;
    handleClose();
  };
  return (
    <FormModal
      open={props.open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={(props.user ? "Edit" : "Add") + " a User"}
    >
      <FormTextInput label="Full Name" field={fullName} />
      <FormTextInput label="E-mail" field={email} />
      {(fullName.isError || email.isError) && (
        <Message
          error
          header="Action Forbidden"
          content="All fields are required!"
        />
      )}
      <Message negative>
        <Message.Header>In Construction!</Message.Header>
        <p>Superuser create and edit users is not available</p>
      </Message>
    </FormModal>
  );
}
