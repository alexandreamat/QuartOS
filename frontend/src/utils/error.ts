import { SerializedError } from "@reduxjs/toolkit";
import { BaseQueryFn, FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import {
  TypedUseMutationResult,
  TypedUseQueryHookResult,
} from "@reduxjs/toolkit/dist/query/react";

export function renderErrorMessage(
  error: FetchBaseQueryError | SerializedError | string,
) {
  console.error(error);
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    if ("status" in error && error.status === 401) {
      return "Unauthorized access. Please login again.";
    }
    if ("data" in error) {
      if (typeof error.data === "string") return error.data;
      if (typeof error.data === "object" && error.data !== null) {
        if ("detail" in error.data) {
          if (typeof error.data.detail === "string") {
            return error.data.detail;
          } else if (Array.isArray(error.data.detail)) {
            for (const item of error.data.detail) {
              if (typeof item === "object") {
                if ("msg" in item && typeof item.msg === "string") {
                  return item.msg;
                }
              }
            }
          }
        }
      }
    }
    if ("error" in error && typeof error.error === "string") {
      return error.error;
    }
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }
  return "An error occurred. Please try again later.";
}

export function logMutationError<R, A, Q extends BaseQueryFn>(
  error: unknown,
  query: TypedUseQueryHookResult<R, A, Q> | TypedUseMutationResult<R, A, Q>,
) {
  console.error(error);
  console.error(query.error);
  console.error(query.originalArgs);
}
