// Copyright (C) 2024 Alexandre Amat
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { api } from "app/services/api";
import FormCurrencyCodeDropdown from "components/FormCurrencyCodeDropdown";
import FormTextInput from "components/FormTextInput";
import useFormField from "hooks/useFormField";
import { useState } from "react";
import { Button, Form, Loader, Message, Segment } from "semantic-ui-react";
import { logMutationError, renderErrorMessage } from "utils/error";

export default function Profile() {
  const me = api.endpoints.readMeUsersMeGet.useQuery();
  const [updateMe, updateMeResult] =
    api.endpoints.updateMeUsersMePut.useMutation();
  const [editMode, setEditMode] = useState(false);

  const fullName = useFormField(me.data?.full_name || "");
  const email = useFormField(me.data?.email || "");
  const password = useFormField("");
  const defaultCurrencyCode = useFormField(
    me.data?.default_currency_code || "",
  );

  const fields = [fullName, email, password, defaultCurrencyCode];

  const handleCancel = () => {
    fullName.set(me.data?.full_name || "");
    email.set(me.data?.email || "");
    defaultCurrencyCode.set(me.data?.default_currency_code || "");
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
        default_currency_code: defaultCurrencyCode.value!,
        type: "defaultuser",
      }).unwrap();
    } catch (error) {
      logMutationError(error, updateMeResult);
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
          <FormCurrencyCodeDropdown
            readOnly={!editMode}
            currencyCode={defaultCurrencyCode}
            label="Default currency"
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
          disabled={me.data ? me.data.type === "demouser" : true}
          content="Edit"
          labelPosition="left"
          icon="edit"
          onClick={() => setEditMode(true)}
        />
      )}
    </>
  );
}
