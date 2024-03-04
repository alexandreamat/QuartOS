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
  generatedApi,
  CreateUsersMeAccountsPostApiResponse,
  CreateUsersMeAccountsPostApiArg,
} from "./generatedApi";

function cacheList<T extends string, R extends { id: number }[]>(
  type: T,
  result?: R,
) {
  return [{ type, id: "*" }, ...(result || []).map(({ id }) => ({ type, id }))];
}

const enhancedApi = generatedApi.enhanceEndpoints({
  endpoints: {
    // MOVEMENTS CRUD
    consolidateUsersMeTransactionsPost: {
      invalidatesTags: (result, error, arg) => [
        "users",
        { type: "transaction_groups", id: "*" },
      ],
    },
    mergeUsersMeTransactionGroupsMergePost: {
      invalidatesTags: (result, error, arg) => [
        "users",
        { type: "transaction_groups", id: "*" },
      ],
    },
    readUsersMeTransactionGroupsTransactionGroupIdGet: {
      providesTags: (result, error, transactionGroupId) => [
        "users",
        { type: "transaction_groups", id: transactionGroupId },
      ],
    },
    readManyUsersMeTransactionGroupsGet: {
      providesTags: (result, error, arg) => [
        "users",
        ...cacheList("transaction_groups", result),
      ],
    },
    updateUsersMeTransactionGroupsTransactionGroupIdPut: {
      invalidatesTags: (result, error, { transactionGroupId }) => [
        "users",
        { type: "transaction_groups", id: transactionGroupId },
      ],
    },
    addUsersMeTransactionGroupsTransactionGroupIdTransactionsPut: {
      invalidatesTags: (result, error, { transactionGroupId }) => [
        "users",
        { type: "transaction_groups", id: transactionGroupId },
      ],
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
    },
    readManyUsersMeTransactionsGet: {
      providesTags: (result, error, arg) => [
        "users",
        ...cacheList("transactions", result),
      ],
    },
    updateUsersMeAccountsAccountIdTransactionsTransactionIdPut: {
      invalidatesTags: (result, error, { accountId, transactionId }) => [
        "users",
        { type: "accounts", id: accountId },
        { type: "transaction_groups", id: "*" },
        { type: "transactions", id: transactionId },
      ],
    },
    deleteUsersMeAccountsAccountIdTransactionsTransactionIdDelete: {
      invalidatesTags: (result, error, { accountId }) => [
        "users",
        { type: "accounts", id: accountId },
        { type: "transaction_groups", id: "*" },
        { type: "transactions", id: "*" },
      ],
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
  },
});

export * from "./generatedApi";
export type AccountApiOut = CreateUsersMeAccountsPostApiResponse;
export type AccountApiIn = CreateUsersMeAccountsPostApiArg["body"];
export type AccountType = CreateUsersMeAccountsPostApiResponse["type"];
export { enhancedApi as api };
