import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";

export interface SimpleQuery {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    error?: FetchBaseQueryError | SerializedError | string;
    originalArgs?: unknown;
}
