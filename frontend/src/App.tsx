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
import routes from "./router/routes";
import { useAppDispatch, useAppSelector } from "app/store";
import TopBar from "components/TopBar";
import Login from "features/auth/Login";
import { SignUp } from "features/auth/SignUp";
import { throttle } from "lodash";
import {
  setCredentials,
  setCurrentUser,
  unsetCurrentUser,
} from "features/auth/slice";
import { api } from "app/services/api";
import { renderErrorMessage } from "utils/error";
import Profile from "features/profile";

function Content() {
  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.label}
          path={route.path}
          element={
            <>
              <Header as="h2">{route.label}</Header>
              <route.component />
            </>
          }
        />
      ))}
      <Route
        key="profile"
        path="/profile"
        element={
          <>
            <Header as="h2">Profile</Header>
            <Profile />
          </>
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
      <div style={{ flex: "0 0 200px" }}>
        <SidebarMenu />
      </div>
      <div style={{ flex: "1", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: "0 0 40px" }}>
          <TopBar />
        </div>
        <div style={{ flex: "1", overflow: "auto" }}>
          <Container style={{ paddingTop: "20px", paddingBottom: "20px" }}>
            <Content />
          </Container>
        </div>
      </div>
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
  const {
    data: me,
    isLoading,
    isError,
    error,
  } = api.endpoints.readMeApiUsersMeGet.useQuery();

  useEffect(() => {
    if (me) {
      dispatch(setCurrentUser(me));
    } else {
      dispatch(unsetCurrentUser());
    }
  }, [dispatch, me]);

  useEffect(() => {
    window.addEventListener("resize", throttledUpdate);
    return () => window.removeEventListener("resize", throttledUpdate);
  }, [throttledUpdate]);

  if (isLoading) return <Loader active size="huge" />;

  if (isError)
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
              <p>{renderErrorMessage(error)}</p>
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
