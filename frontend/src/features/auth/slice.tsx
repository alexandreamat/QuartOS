import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { UserApiOut } from "app/services/api";

interface State {
  current_user?: UserApiOut;
  token?: string;
}

const slice = createSlice({
  name: "auth",
  initialState: {} as State,
  reducers: {
    setCredentials: (state, { payload }: PayloadAction<string>) => {
      state.token = payload;
    },
    setCurrentUser: (state, { payload }: PayloadAction<UserApiOut>) => {
      state.current_user = payload;
    },
    unsetCurrentUser: (state) => {
      state.current_user = undefined;
    },
    unsetCredentials: (state) => {
      state.token = undefined;
    },
  },
});

export const {
  setCredentials,
  setCurrentUser,
  unsetCredentials,
  unsetCurrentUser,
} = slice.actions;

export default slice.reducer;
