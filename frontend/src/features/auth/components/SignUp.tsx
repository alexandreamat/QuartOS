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
    api.endpoints.signupApiUsersSignupPost.useMutation();

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
              field={fields.password}
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
