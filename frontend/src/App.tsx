import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  Container,
  Grid,
  Header,
  Loader,
  Message,
  Sidebar,
} from "semantic-ui-react";
import SidebarMenu from "components/SidebarMenu";
import routes from "./router";
import { useAppDispatch, useAppSelector } from "app/store";
import TopBar from "components/TopBar";
import Login from "features/auth/components/Login";
import { SignUp } from "features/auth/components/SignUp";
import { throttle } from "lodash";
import {
  setCredentials,
  setCurrentUser,
  unsetCurrentUser,
} from "features/auth/slice";
import { api } from "app/services/api";
import { renderErrorMessage } from "utils/error";
import Profile from "features/profile";
import FlexColumn from "components/FlexColumn";

function Content() {
  return (
    <Routes>
      {routes.map((route) => (
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
              <div style={{ flex: 1, overflow: "hidden" }}>
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
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <SidebarMenu />
      <FlexColumn style={{ flex: 1 }}>
        <TopBar />
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
  const dispatch = useAppDispatch();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const updateMedia = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const throttledUpdate = throttle(updateMedia, 200);
  const meQuery = api.endpoints.readMeApiUsersMeGet.useQuery();

  useEffect(() => {
    if (meQuery.data) {
      dispatch(setCurrentUser(meQuery.data));
    } else {
      dispatch(unsetCurrentUser());
    }
  }, [dispatch, meQuery.data]);

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
