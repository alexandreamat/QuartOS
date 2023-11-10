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
