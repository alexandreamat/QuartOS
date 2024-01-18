import { BodyLoginAuthLoginPost, api } from "app/services/api";
import { useAppDispatch } from "app/store";
import { useNavigate } from "react-router-dom";
import { logMutationError } from "utils/error";
import { setCredentials, unsetCredentials, unsetCurrentUser } from "./slice";

export function useLogin(username: string, password: string) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [login, loginResult] = api.endpoints.loginAuthLoginPost.useMutation();

  const submitLogin = async () => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    try {
      const token = await login(
        formData as unknown as BodyLoginAuthLoginPost,
      ).unwrap();
      dispatch(setCredentials(token.access_token));
    } catch (error) {
      logMutationError(error, loginResult);
      return;
    }
    navigate("/");
  };

  return [submitLogin, loginResult] as const;
}
export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function handleLogout() {
    dispatch(unsetCredentials());
    dispatch(unsetCurrentUser());
    dispatch(api.internalActions.resetApiState());
    navigate("/");
  }

  return handleLogout;
}
