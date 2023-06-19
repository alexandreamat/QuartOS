import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";

export interface SimpleQuery {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    isFetching?: boolean;
    error?: FetchBaseQueryError | SerializedError | string;
    originalArgs?: unknown;
}

export interface SimpleDataQuery<T> extends SimpleQuery {
    data?: T[]
}