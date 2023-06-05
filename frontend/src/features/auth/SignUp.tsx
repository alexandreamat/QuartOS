import React, { useState } from "react";
import {
  Segment,
  Grid,
  Form,
  Button,
  Message,
  Header,
} from "semantic-ui-react";
import { useNavigate } from "react-router";

import { api } from "app/services/api";
import { renderErrorMessage } from "utils/error";

export function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [signUp, signUpResult] =
    api.endpoints.signupApiUsersSignupPost.useMutation();

  const handleSubmit = async (_: React.MouseEvent) => {
    try {
      await signUp({
        email: email,
        password: password,
        full_name: fullName,
        is_superuser: false,
      }).unwrap();
    } catch (error) {
      console.error(error);
      console.error(signUpResult.error);
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
            <Form.Input
              icon="user"
              iconPosition="left"
              placeholder="E-mail address"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.currentTarget.value)
              }
              autoFocus
              required
              type="email"
            ></Form.Input>
            <Form.Input
              icon="user"
              iconPosition="left"
              placeholder="Full name"
              value={fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFullName(e.currentTarget.value)
              }
              autoFocus
              required
              type="name"
            ></Form.Input>
            <Form.Input
              fluid
              icon="lock"
              iconPosition="left"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.currentTarget.value)
              }
              required
            ></Form.Input>
            <Form.Input
              fluid
              icon="lock"
              iconPosition="left"
              value={passwordConfirmation}
              type="password"
              placeholder="Confirm password"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPasswordConfirmation(e.currentTarget.value)
              }
              required
            ></Form.Input>
            {signUpResult.isError && (
              <Message negative>
                {renderErrorMessage(signUpResult.error)}
              </Message>
            )}
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
