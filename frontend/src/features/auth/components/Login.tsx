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

import { QueryErrorMessage } from "components/QueryErrorMessage";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Form,
  Grid,
  Header,
  Message,
  Segment,
} from "semantic-ui-react";
import { useLogin } from "../hooks";

export default function Login() {
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [login, loginResult] = useLogin(username, password);

  const handleSumit = async () => {
    await login();
  };

  return (
    <Grid textAlign="center" style={{ height: "100vh" }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h2" color="teal" textAlign="center">
          Log in to your account
        </Header>
        <Form size="large">
          <Segment textAlign="left">
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
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.currentTarget.value);
              }}
              required
            />
            <Form.Checkbox
              label="Show password"
              checked={showPassword}
              onChange={(e, data) => {
                setShowPassword(data.checked || false);
              }}
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
          New to us? <Link to="/signup">Sign Up!</Link>
        </Message>
      </Grid.Column>
    </Grid>
  );
}
