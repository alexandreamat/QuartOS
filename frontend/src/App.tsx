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

import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Header,
  Loader,
  Message,
  Sidebar,
} from "semantic-ui-react";
import SidebarMenu from "components/SidebarMenu";
import routes, { RouteI } from "./router";
import { useAppDispatch, useAppSelector } from "app/store";
import TopBar from "components/TopBar";
import Login from "features/auth/components/Login";
import { SignUp } from "features/auth/components/SignUp";
import { throttle } from "lodash";
import {
  setCredentials,
  setCurrentUser,
  unsetCredentials,
  unsetCurrentUser,
} from "features/auth/slice";
import { api } from "app/services/api";
import { renderErrorMessage } from "utils/error";
import Profile from "features/profile";
import FlexColumn from "components/FlexColumn";

function flattenRoutes(routes?: RouteI[], parent?: RouteI) {
  if (!routes) return [];

  const flatPath = parent ? parent.path : "";
  let flatRoutes: RouteI[] = [];
  for (let route of routes)
    flatRoutes = [
      { ...route, path: flatPath + route.path },
      ...flattenRoutes(route.routes, route),
      ...flatRoutes,
    ];
  return flatRoutes;
}

function Content() {
  return (
    <Routes>
      {flattenRoutes(routes).map((route) => (
        <Route
          key={route.label}
          path={route.path}
          element={
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Header as="h2">{route.label}</Header>
              <div style={{ flex: 1, overflow: "hidden", padding: 1 }}>
                <route.component />
              </div>
            </div>
          }
        />
      ))}
      <Route
        key="profile"
        path="/profile"
        element={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Header as="h2">Profile</Header>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <Profile />
            </div>
          </div>
        }
      />
    </Routes>
  );
}

function MobileApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <Sidebar.Pushable>
        <Sidebar
          animation="overlay"
          direction="left"
          onHide={() => setSidebarOpen(false)}
          visible={sidebarOpen}
        >
          <SidebarMenu />
        </Sidebar>
        <Sidebar.Pusher dimmed={sidebarOpen}>
          <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <Content />
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </div>
  );
}

function DesktopApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <SidebarMenu style={sidebarOpen ? {} : { display: "none" }} />
      <FlexColumn style={{ flex: 1 }}>
        <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <FlexColumn.Auto>
          <Container style={{ height: "100%" }}>
            <Content />
          </Container>
        </FlexColumn.Auto>
      </FlexColumn>
    </div>
  );
}

function UnauthenticatedApp() {
  return (
    <Container>
      <Routes>
        <Route key="key" path="/login" element={<Login />} />
        <Route key="login" path="/signup" element={<SignUp />} />
        <Route key="default" path="/*" element={<Login />} />
      </Routes>
    </Container>
  );
}

function AuthenticatedApp() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const updateMedia = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const throttledUpdate = throttle(updateMedia, 200);
  const meQuery = api.endpoints.readMeUsersMeGet.useQuery();

  useEffect(() => {
    if (meQuery.data) {
      dispatch(setCurrentUser(meQuery.data));
    } else {
      dispatch(unsetCurrentUser());
    }
  }, [dispatch, meQuery.data]);

  useEffect(() => {
    if (!meQuery.isError) return;
    dispatch(unsetCredentials());
    dispatch(unsetCurrentUser());
    navigate("/");
  }, [meQuery.isError, dispatch, navigate]);

  useEffect(() => {
    window.addEventListener("resize", throttledUpdate);
    return () => window.removeEventListener("resize", throttledUpdate);
  }, [throttledUpdate]);

  if (meQuery.isLoading) return <Loader active size="huge" />;

  if (meQuery.isError)
    return (
      <Container>
        <Grid
          textAlign="center"
          style={{ height: "100vh" }}
          verticalAlign="middle"
        >
          <Grid.Column style={{ maxWidth: 450 }}>
            <Message negative>
              <Message.Header>There's been an error</Message.Header>
              <p>{renderErrorMessage(meQuery.error)}</p>
            </Message>
          </Grid.Column>
        </Grid>
      </Container>
    );

  return isMobile ? <MobileApp /> : <DesktopApp />;
}

function App() {
  const token = useAppSelector((state) => state.auth.token);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      dispatch(setCredentials(token));
    }
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  return (
    <BrowserRouter>
      {token ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </BrowserRouter>
  );
}

export default App;
