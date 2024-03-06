// Copyright (C) 2024 Alexandre Amat
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

import {
  DefinitionsFromApi,
  OverrideResultType,
  TagTypesFromApi,
} from "@reduxjs/toolkit/dist/query/endpointDefinitions";

import {
  generatedApi,
  CreateUsersMeAccountsPostApiResponse,
  CreateUsersMeAccountsPostApiArg,
  TransactionApiOut as TransactionApiOutRaw,
  TransactionGroupApiOut as TransactionGroupApiOutRaw,
  TransactionApiIn as TransactionApiInRaw,
  ReadUsersMeAccountsAccountIdGetApiResponse as AccountApiOutRaw,
  PlStatementApiOut as PlStatementApiOutRaw,
  DetailedPlStatementApiOut as DetailedPlStatementApiOutRaw,
} from "./generatedApi";
import { dateToString, stringToDate } from "utils/time";

type ConsolidatedTransactionApiOutRaw =
  | TransactionGroupApiOutRaw
  | TransactionApiOutRaw;

function cacheList<T extends string, R extends { id: number }[] | undefined>(
  type: T,
  result?: R,
) {
  return [{ type, id: "*" }, ...(result || []).map(({ id }) => ({ type, id }))];
}

const accountApiOutFromRaw = (t: AccountApiOutRaw) => ({
  ...t,
  balance: Number(t.balance),
  initial_balance: Number(t.initial_balance),
});

const transactionApiOutFromRaw = (t: TransactionApiOutRaw) => ({
  ...t,
  amount_default_currency: Number(t.amount_default_currency),
  timestamp: stringToDate(t.timestamp),
  category_id: t.category_id || undefined,
  amount: Number(t.amount),
  transaction_group_id: t.transaction_group_id || undefined,
  account_balance: Number(t.account_balance),
});

const transactionApiInFromRaw = (t: TransactionApiInRaw) => ({
  ...t,
  timestamp: stringToDate(t.timestamp),
  category_id: t.category_id || undefined,
  amount: Number(t.amount),
});

export const transactionApiInToRaw = (
  t: TransactionApiIn,
): TransactionApiInRaw => ({
  ...t,
  timestamp: dateToString(t.timestamp),
  amount: t.amount.toFixed(2),
});

const transactionGroupApiOutFromRaw = (t: TransactionGroupApiOutRaw) => ({
  ...t,
  amount_default_currency: Number(t.amount_default_currency),
  timestamp: stringToDate(t.timestamp),
  category_id: t.category_id || undefined,
  amount: Number(t.amount),
  account_id: t.account_id || undefined,
});

const consolidatedTransactionOutFromRaw = (
  r: ConsolidatedTransactionApiOutRaw[],
) =>
  r.map((t) =>
    t.consolidated
      ? transactionGroupApiOutFromRaw(t)
      : transactionApiOutFromRaw(t),
  );

const plStatementApiOutFromRaw = (t: PlStatementApiOutRaw) => ({
  ...t,
  timestamp__ge: stringToDate(t.timestamp__ge),
  timestamp__lt: stringToDate(t.timestamp__lt),
  income: Number(t.income),
  expenses: Number(t.expenses),
});

const detailedPlStatementApiOutFromRaw = (t: DetailedPlStatementApiOutRaw) => ({
  ...t,
  timestamp__ge: stringToDate(t.timestamp__ge),
  timestamp__lt: stringToDate(t.timestamp__lt),
  income: Number(t.income),
  expenses: Number(t.expenses),
  income_by_category: Object.fromEntries(
    Object.entries(t.income_by_category).map(([k, v]) => [k, Number(v)]),
  ),
  expenses_by_category: Object.fromEntries(
    Object.entries(t.expenses_by_category).map(([k, v]) => [k, Number(v)]),
  ),
});

export type AccountApiOut = ReturnType<typeof accountApiOutFromRaw>;
export type TransactionApiIn = ReturnType<typeof transactionApiInFromRaw>;
export type TransactionApiOut = ReturnType<typeof transactionApiOutFromRaw>;
export type PlStatementApiOut = ReturnType<typeof plStatementApiOutFromRaw>;
export type DetailedPlStatementApiOut = ReturnType<
  typeof detailedPlStatementApiOutFromRaw
>;

export type TransactionGroupApiOut = ReturnType<
  typeof transactionGroupApiOutFromRaw
>;

export type ConsolidatedTransaction =
  | TransactionGroupApiOut
  | TransactionApiOut;

type Definitions = DefinitionsFromApi<typeof generatedApi>;
type TagTypes = TagTypesFromApi<typeof generatedApi>;

type EnhancedDefinition<T extends keyof Definitions, R> = {
  [K in T]: OverrideResultType<Definitions[T], R>;
};

type EnhancedDefs = Omit<
  Definitions,
  | "readManyUsersMeTransactionsGet"
  | "readUsersMeTransactionGroupsTransactionGroupIdGet"
  | "consolidateUsersMeTransactionsPost"
  | "mergeUsersMeTransactionGroupsMergePost"
  | "createManyUsersMeAccountsAccountIdTransactionsBatchPost"
  | "createUsersMeAccountsAccountIdTransactionsPost"
  | "updateUsersMeAccountsAccountIdTransactionsTransactionIdPut"
  | "readManyUsersMeTransactionGroupsTransactionGroupIdTransactionsGet"
  | "readManyUsersMeTransactionGroupsGet"
  | "updateUsersMeTransactionGroupsTransactionGroupIdPut"
  | "addUsersMeTransactionGroupsTransactionGroupIdTransactionsPut"
  | "removeUsersMeTransactionGroupsTransactionGroupIdTransactionsTransactionIdDelete"
  | "previewUsersMeAccountsAccountIdTransactionsPreviewPost"
  | "readManyUsersMeAccountsGet"
  | "readUsersMeAccountsAccountIdGet"
  | "getManyPlStatementsUsersMeAnalyticsGet"
  | "getDetailedPlStatementUsersMeAnalyticsDetailedTimestampGeTimestampLtGet"
  | "readManyUsersMeAccountsAccountIdTransactionsGet"
> &
  EnhancedDefinition<
    "readManyUsersMeTransactionsGet",
    ConsolidatedTransaction[]
  > &
  EnhancedDefinition<
    "readUsersMeTransactionGroupsTransactionGroupIdGet",
    TransactionGroupApiOut
  > &
  EnhancedDefinition<
    "consolidateUsersMeTransactionsPost",
    TransactionGroupApiOut
  > &
  EnhancedDefinition<
    "mergeUsersMeTransactionGroupsMergePost",
    TransactionGroupApiOut
  > &
  EnhancedDefinition<
    "createManyUsersMeAccountsAccountIdTransactionsBatchPost",
    TransactionApiOut[]
  > &
  EnhancedDefinition<
    "createUsersMeAccountsAccountIdTransactionsPost",
    TransactionApiOut
  > &
  EnhancedDefinition<
    "updateUsersMeAccountsAccountIdTransactionsTransactionIdPut",
    TransactionApiOut
  > &
  EnhancedDefinition<
    "readManyUsersMeTransactionGroupsTransactionGroupIdTransactionsGet",
    TransactionApiOut[]
  > &
  EnhancedDefinition<
    "readManyUsersMeAccountsAccountIdTransactionsGet",
    TransactionApiOut[]
  > &
  EnhancedDefinition<
    "readManyUsersMeTransactionGroupsGet",
    TransactionGroupApiOut[]
  > &
  EnhancedDefinition<
    "updateUsersMeTransactionGroupsTransactionGroupIdPut",
    TransactionGroupApiOut
  > &
  EnhancedDefinition<
    "addUsersMeTransactionGroupsTransactionGroupIdTransactionsPut",
    TransactionGroupApiOut
  > &
  EnhancedDefinition<
    "removeUsersMeTransactionGroupsTransactionGroupIdTransactionsTransactionIdDelete",
    TransactionGroupApiOut
  > &
  EnhancedDefinition<
    "previewUsersMeAccountsAccountIdTransactionsPreviewPost",
    TransactionApiIn[]
  > &
  EnhancedDefinition<"readManyUsersMeAccountsGet", AccountApiOut[]> &
  EnhancedDefinition<"readUsersMeAccountsAccountIdGet", AccountApiOut> &
  EnhancedDefinition<
    "getManyPlStatementsUsersMeAnalyticsGet",
    PlStatementApiOut[]
  > &
  EnhancedDefinition<
    "getDetailedPlStatementUsersMeAnalyticsDetailedTimestampGeTimestampLtGet",
    DetailedPlStatementApiOut
  >;

const enhancedApi = generatedApi.enhanceEndpoints<TagTypes, EnhancedDefs>({
  endpoints: {
    // PL
    getManyPlStatementsUsersMeAnalyticsGet: {
      transformResponse: (r: PlStatementApiOutRaw[]) =>
        r.map(plStatementApiOutFromRaw),
    },
    getDetailedPlStatementUsersMeAnalyticsDetailedTimestampGeTimestampLtGet: {
      transformResponse: detailedPlStatementApiOutFromRaw,
    },
    // ACCOUNTS CRUD
    readManyUsersMeAccountsGet: {
      transformResponse: (r: AccountApiOutRaw[]) => r.map(accountApiOutFromRaw),
    },
    readUsersMeAccountsAccountIdGet: {
      transformResponse: accountApiOutFromRaw,
    },
    // MOVEMENTS CRUD
    consolidateUsersMeTransactionsPost: {
      invalidatesTags: (result, error, arg) => [
        "users",
        { type: "transaction_groups", id: "*" },
      ],
      transformResponse: transactionGroupApiOutFromRaw,
    },
    mergeUsersMeTransactionGroupsMergePost: {
      invalidatesTags: (result, error, arg) => [
        "users",
        { type: "transaction_groups", id: "*" },
      ],
      transformResponse: transactionGroupApiOutFromRaw,
    },
    readUsersMeTransactionGroupsTransactionGroupIdGet: {
      providesTags: (result, error, transactionGroupId) => [
        "users",
        { type: "transaction_groups", id: transactionGroupId },
      ],
      transformResponse: transactionGroupApiOutFromRaw,
    },
    updateUsersMeTransactionGroupsTransactionGroupIdPut: {
      invalidatesTags: (result, error, { transactionGroupId }) => [
        "users",
        { type: "transaction_groups", id: transactionGroupId },
      ],
      transformResponse: transactionGroupApiOutFromRaw,
    },
    addUsersMeTransactionGroupsTransactionGroupIdTransactionsPut: {
      invalidatesTags: (result, error, { transactionGroupId }) => [
        "users",
        { type: "transaction_groups", id: transactionGroupId },
      ],
      transformResponse: transactionGroupApiOutFromRaw,
    },
    deleteUsersMeTransactionGroupsTransactionGroupIdDelete: {
      invalidatesTags: (result, error, arg) => [
        "users",
        { type: "transaction_groups", id: "*" },
      ],
    },

    // TRANSACTIONS CRUD
    createUsersMeAccountsAccountIdTransactionsPost: {
      invalidatesTags: (result, error, { accountId }) => [
        "users",
        { type: "accounts", id: accountId },
        { type: "transaction_groups", id: "*" },
        { type: "transactions", id: "*" },
      ],
      transformResponse: transactionApiOutFromRaw,
    },
    readManyUsersMeTransactionsGet: {
      providesTags: (result, error, arg) => [
        "users",
        ...cacheList("transactions", result),
      ],
      transformResponse: consolidatedTransactionOutFromRaw,
    },
    updateUsersMeAccountsAccountIdTransactionsTransactionIdPut: {
      invalidatesTags: (result, error, { accountId, transactionId }) => [
        "users",
        { type: "accounts", id: accountId },
        { type: "transaction_groups", id: "*" },
        { type: "transactions", id: transactionId },
      ],
      transformResponse: transactionApiOutFromRaw,
    },
    deleteUsersMeAccountsAccountIdTransactionsTransactionIdDelete: {
      invalidatesTags: (result, error, { accountId }) => [
        "users",
        { type: "accounts", id: accountId },
        { type: "transaction_groups", id: "*" },
        { type: "transactions", id: "*" },
      ],
    },
    createManyUsersMeAccountsAccountIdTransactionsBatchPost: {
      transformResponse: (r: TransactionApiOutRaw[]) =>
        r.map(transactionApiOutFromRaw),
    },
    readManyUsersMeTransactionGroupsTransactionGroupIdTransactionsGet: {
      transformResponse: (r: TransactionApiOutRaw[]) =>
        r.map(transactionApiOutFromRaw),
    },
    readManyUsersMeAccountsAccountIdTransactionsGet: {
      transformResponse: (t: TransactionApiOutRaw[]) =>
        t.map(transactionApiOutFromRaw),
    },
    previewUsersMeAccountsAccountIdTransactionsPreviewPost: {
      transformResponse: (t: TransactionApiInRaw[]) =>
        t.map(transactionApiInFromRaw),
    },

    // FILES CRUD
    createUsersMeAccountsAccountIdTransactionsTransactionIdFilesPost: {
      invalidatesTags: (result, error, { accountId, transactionId }) => [
        "users",
        { type: "accounts", id: accountId },
        { type: "transactions", id: transactionId },
        { type: "files", id: "*" },
      ],
    },
    readUsersMeAccountsAccountIdTransactionsTransactionIdFilesFileIdGet: {
      query: ({ accountId, transactionId, fileId }) => ({
        url: `/api/users/me/accounts/${accountId}/transactions/${transactionId}/files/${fileId}`,
        responseHandler: (response) => response.blob(),
      }),
      providesTags: (result, error, { accountId, transactionId, fileId }) => [
        "users",
        { type: "accounts", id: accountId },
        // { type: "transaction_groups", id: transactionGroupId },
        { type: "transactions", id: transactionId },
        { type: "files", id: fileId },
      ],
    },
    readManyUsersMeAccountsAccountIdTransactionsTransactionIdFilesGet: {
      providesTags: (result, error, { accountId, transactionId }) => [
        "users",
        { type: "accounts", id: accountId },
        // { type: "transaction_groups", id: transactionGroupId },
        { type: "transactions", id: transactionId },
        ...cacheList("files", result),
      ],
    },
    deleteUsersMeAccountsAccountIdTransactionsTransactionIdFilesFileIdDelete: {
      invalidatesTags: (result, error, { accountId, transactionId }) => [
        "users",
        { type: "accounts", id: accountId },
        // { type: "transaction_groups", id: transactionGroupId },
        { type: "transactions", id: transactionId },
        { type: "files", id: "*" },
      ],
    },
    readManyUsersMeTransactionGroupsGet: {
      transformResponse: (r: TransactionGroupApiOutRaw[]) =>
        r.map(transactionGroupApiOutFromRaw),
    },
    removeUsersMeTransactionGroupsTransactionGroupIdTransactionsTransactionIdDelete:
      { transformResponse: transactionGroupApiOutFromRaw },
  },
});

export * from "./generatedApi";

export type AccountApiIn = CreateUsersMeAccountsPostApiArg["body"];
export type AccountType = CreateUsersMeAccountsPostApiResponse["type"];
export { enhancedApi as api };
