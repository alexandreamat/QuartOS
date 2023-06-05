import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";

export function renderErrorMessage(error: FetchBaseQueryError | SerializedError | string) {
    console.error(error)
    if (typeof error === 'string' ) return error;
    if (typeof error === 'object') {
        if ('status' in error && error.status === 401) {
            return 'Unauthorized access. Please login again.';
        }
        if ('data' in error) {
            if (typeof error.data === 'string') return error.data;
            if (typeof error.data === 'object' && error.data !== null) {
                if ('detail' in error.data && typeof error.data.detail === 'string') {
                    return error.data.detail;
                }
            }
        }
        if ('error' in error && typeof error.error === 'string') {
            return error.error;
        }
        if ('message' in error && typeof error.message === 'string') {
            return error.message;
        }
    }
    return 'An error occurred. Please try again later.';
}