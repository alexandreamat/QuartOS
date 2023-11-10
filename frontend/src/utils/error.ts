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

import { BaseQueryFn } from "@reduxjs/toolkit/dist/query";
import {
  TypedUseMutationResult,
  TypedUseQueryHookResult,
} from "@reduxjs/toolkit/dist/query/react";

export function renderErrorMessage(error: any) {
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
