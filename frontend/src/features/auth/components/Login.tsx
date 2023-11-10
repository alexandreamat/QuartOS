// Copyright (C) 2023 Alexandre Amat
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

import { BodyLoginApiAuthLoginPost, api } from "app/services/api";
import { RootState, useAppDispatch } from "app/store";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  Grid,
  Header,
  Image,
  Message,
  Segment,
} from "semantic-ui-react";
import { logMutationError } from "utils/error";
import { setCredentials } from "../slice";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.current_user,
  );

  const [login, loginResult] =
    api.endpoints.loginApiAuthLoginPost.useMutation();

  const handleSumit = async () => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    try {
      const token = await login(
        formData as unknown as BodyLoginApiAuthLoginPost,
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
        <Image src="%PUBLIC_URL%/favicon-192.png" size="medium" centered />
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
