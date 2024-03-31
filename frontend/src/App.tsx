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
import { useAppDispatch, useAppSelector } from "app/store";
import FlexColumn from "components/FlexColumn";
import FlexRow from "components/FlexRow";
import SidebarMenu from "components/SidebarMenu";
import TopBar from "components/TopBar";
import Login from "features/auth/components/Login";
import { SignUp } from "features/auth/components/SignUp";
import {
  setCredentials,
  setCurrentUser,
  unsetCredentials,
  unsetCurrentUser,
} from "features/auth/slice";
import Profile from "features/profile";
import { throttle } from "lodash";
import { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import {
  Container,
  Grid,
  Header,
  Loader,
  Message,
  Sidebar,
} from "semantic-ui-react";
import { renderErrorMessage } from "utils/error";
import routes, { RouteI } from "./router";

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

const Content = () => (
  <Routes>
    {flattenRoutes(routes).map((route) => (
      <Route
        key={route.label}
        path={route.path}
        element={
          <FlexColumn>
            <Header as="h2">{route.label}</Header>
            <FlexColumn.Auto>
              <route.component />
            </FlexColumn.Auto>
          </FlexColumn>
        }
      />
    ))}
    <Route
      key="profile"
      path="/profile"
      element={
        <FlexColumn>
          <Header as="h2">Profile</Header>
          <FlexColumn.Auto>
            <Profile />
          </FlexColumn.Auto>
        </FlexColumn>
      }
    />
    <Route key="default" path="/*" element={<Navigate to="/" />} />
    <Route key="base" path="/" element={<Navigate to="/transactions" />} />
  </Routes>
);

function MobileApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Sidebar.Pushable style={{ height: "100vh" }}>
      <Sidebar
        animation="overlay"
        direction="left"
        onHide={() => setSidebarOpen(false)}
        visible={sidebarOpen}
      >
        <SidebarMenu fluid />
      </Sidebar>
      <Sidebar.Pusher dimmed={sidebarOpen} style={{ height: "100%" }}>
        <FlexColumn>
          <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <FlexColumn.Auto>
            <Container style={{ height: "100%" }}>
              <Content />
            </Container>
          </FlexColumn.Auto>
        </FlexColumn>
      </Sidebar.Pusher>
    </Sidebar.Pushable>
  );
}

function DesktopApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <FlexRow style={{ height: "100vh" }}>
      {sidebarOpen && <SidebarMenu />}
      <FlexRow.Auto>
        <FlexColumn>
          <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <FlexColumn.Auto>
            <Container style={{ height: "100%" }}>
              <Content />
            </Container>
          </FlexColumn.Auto>
        </FlexColumn>
      </FlexRow.Auto>
    </FlexRow>
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
