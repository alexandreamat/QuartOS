import React, { useState } from "react";
import { api } from "app/services/api";
import FormTextInput from "components/FormTextInput";
import useFormField from "hooks/useFormField";
import { Button, Form, Loader, Message, Segment } from "semantic-ui-react";
import { renderErrorMessage } from "utils/error";

export default function Profile() {
  const me = api.endpoints.readMeApiUsersMeGet.useQuery();
  const [updateMe, updateMeResult] =
    api.endpoints.updateMeApiUsersMePut.useMutation();
  const [editMode, setEditMode] = useState(false);

  const fullName = useFormField(me.data?.full_name || "");
  const email = useFormField(me.data?.email || "");
  const password = useFormField("");

  const fields = [fullName, email, password];

  const handleCancel = () => {
    fullName.set(me.data?.full_name || "");
    email.set(me.data?.email || "");
    password.set("");
    fields.forEach((field) => field.reset());
    setEditMode(false);
  };

  const handleSubmit = async () => {
    const invalidFields = fields.filter((field) => !field.validate());
    if (invalidFields.length > 0) return;
    try {
      await updateMe({
        full_name: fullName.value!,
        email: email.value!,
        password: password.value!,
        is_superuser: false,
      }).unwrap();
    } catch (error) {
      console.error(error);
      console.error(updateMeResult.error);
      return;
    }
    setEditMode(false);
  };

  if (!me.data) return <Loader active />;

  return (
    <>
      <Segment>
        <Form>
          <FormTextInput
            readOnly={!editMode}
            label="Full Name"
            field={fullName}
          />
          <FormTextInput
            type="email"
            readOnly={!editMode}
            label="E-mail"
            field={email}
          />
          {editMode && (
            <FormTextInput type="password" label="Password" field={password} />
          )}
        </Form>
      </Segment>
      {password.isError && (
        <Message
          error
          header="Action Forbidden"
          content="All fields are required!"
        />
      )}
      {updateMeResult.isError && (
        <Message header="An error has occurred!" negative>
          {renderErrorMessage(updateMeResult.error)}
        </Message>
      )}
      {editMode ? (
        <>
          <Button
            content="Cancel"
            labelPosition="left"
            icon="cancel"
            onClick={handleCancel}
          />
          <Button
            content="Save"
            labelPosition="left"
            icon="checkmark"
            onClick={handleSubmit}
            positive
          />
        </>
      ) : (
        <Button
          content="Edit"
          labelPosition="left"
          icon="edit"
          onClick={() => setEditMode(true)}
        />
      )}
    </>
  );
}
