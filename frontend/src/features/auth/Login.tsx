import { RootState, useAppDispatch } from "app/store";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  Grid,
  Header,
  Message,
  Segment,
} from "semantic-ui-react";
import { setCredentials } from "./slice";
import { BodyLoginApiAuthLoginPost, api } from "app/services/api";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { logMutationError } from "utils/error";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.current_user
  );

  const [login, loginResult] =
    api.endpoints.loginApiAuthLoginPost.useMutation();

  const handleSumit = async () => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    try {
      const token = await login(
        formData as unknown as BodyLoginApiAuthLoginPost
      ).unwrap();
      dispatch(setCredentials(token.access_token));
    } catch (error) {
      logMutationError(error, loginResult);
      return;
    }
    navigate("/");
  };

  if (isAuthenticated) return <Navigate to="/" />;

  return (
    <Grid textAlign="center" style={{ height: "100vh" }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h2" color="teal" textAlign="center">
          Log in to your account
        </Header>
        <Form size="large">
          <Segment>
            <Form.Input
              fluid
              icon="user"
              iconPosition="left"
              placeholder="E-mail address"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setusername(e.currentTarget.value);
              }}
              autoFocus
              required
            />
            <Form.Input
              fluid
              icon="lock"
              iconPosition="left"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.currentTarget.value);
              }}
              required
            />
            <QueryErrorMessage query={loginResult} />
            <Button
              color="teal"
              fluid
              size="large"
              onClick={handleSumit}
              loading={loginResult.isLoading}
            >
              Login
            </Button>
          </Segment>
        </Form>
        <Message>
          New to us? <Link to="/signup">Sign Up</Link>
        </Message>
      </Grid.Column>
    </Grid>
  );
}
