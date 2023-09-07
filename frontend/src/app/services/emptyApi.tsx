import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "app/store";
import { BASE_URL } from "env";

export const emptySplitApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: () => ({}),
});
