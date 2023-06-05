import {
  BaseQueryFn,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "app/store";
import { BASE_URL } from "env";

const delayedBaseQuery = async (args: any, api: any, extraOptions: any) => {
  const result = await fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  })(args, api, extraOptions);

  // Wait for 2 seconds before returning the result
  // await new Promise((resolve) => setTimeout(resolve, 2000));

  return result;
};

export const emptySplitApi = createApi({
  baseQuery: delayedBaseQuery,
  endpoints: () => ({}),
});

// await new Promise((resolve) => setTimeout(resolve, 2000));
