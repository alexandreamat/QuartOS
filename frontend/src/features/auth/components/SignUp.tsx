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

import React from "react";
import { Segment, Grid, Form, Button, Header } from "semantic-ui-react";
import { useNavigate } from "react-router";

import { api } from "app/services/api";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { logMutationError } from "utils/error";
import FormCurrencyCodeDropdown from "components/FormCurrencyCodeDropdown";
import useFormField from "hooks/useFormField";
import FormTextInput from "components/FormTextInput";

export function SignUp() {
  const navigate = useNavigate();

  const fields = {
    email: useFormField(""),
    fullName: useFormField(""),
    password: useFormField(""),
    passwordConfirmation: useFormField(""),
    defaultCurrencyCode: useFormField(""),
  };

  const [signUp, signUpResult] =
    api.endpoints.signupUsersSignupPost.useMutation();

  const handleSubmit = async (_: React.MouseEvent) => {
    const invalidFields = Object.values(fields).filter((f) => !f.validate());
    if (invalidFields.length > 0) return;

    try {
      await signUp({
        email: fields.email.value!,
        password: fields.password.value!,
        full_name: fields.fullName.value!,
        is_superuser: false,
        default_currency_code: fields.defaultCurrencyCode.value!,
      }).unwrap();
    } catch (error) {
      logMutationError(error, signUpResult);
      return;
    }
    navigate("/");
  };

  return (
    <Grid textAlign="center" style={{ height: "100vh" }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h2" color="teal" textAlign="center">
          Sign Up for QuartOS
        </Header>
        <Form size="large">
          <Segment>
            <FormTextInput
              icon="user"
              field={fields.email}
              label="E-mail address"
              type="email"
            />
            <FormTextInput
              icon="user"
              field={fields.fullName}
              label="Full name"
              type="name"
            />
            <FormTextInput
              icon="lock"
              field={fields.password}
              label="Password"
              type="password"
            />
            <FormTextInput
              icon="lock"
              field={fields.passwordConfirmation}
              label="Confirm password"
              type="password"
            />
            <FormCurrencyCodeDropdown
              currencyCode={fields.defaultCurrencyCode}
            />
            <QueryErrorMessage query={signUpResult} />
            <Button
              color="teal"
              fluid
              size="large"
              onClick={handleSubmit}
              loading={signUpResult.isLoading}
            >
              Sign Up!
            </Button>
          </Segment>
        </Form>
      </Grid.Column>
    </Grid>
  );
}
