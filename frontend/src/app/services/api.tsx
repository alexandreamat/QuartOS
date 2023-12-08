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

import {
  generatedApi,
  ReadUsersMeAccountsAccountIdGetApiResponse,
  CreateUsersMeAccountsPostApiArg,
} from "./generatedApi";

const ALL = "*";

function cacheList<T extends string, R extends { id: number }[]>(
  type: T,
  result?: R,
) {
  return [{ type, id: ALL }, ...(result || []).map(({ id }) => ({ type, id }))];
}

const enhancedApi = generatedApi.enhanceEndpoints({
  endpoints: {
    // MOVEMENTS CRUD
    createUsersMeMovementsPost: {
      invalidatesTags: (result, error, arg) => [
        "users",
        { type: "movements", id: ALL },
      ],
    },
    createManyUsersMeAccountsAccountIdMovementsPost: {
      invalidatesTags: (result, error, { accountId }) => [
        "users",
        { type: "accounts", id: accountId },
        ...cacheList("movements", result),
      ],
    },
    readUsersMeMovementsMovementIdGet: {
      providesTags: (result, error, movementId) => [
        "users",
        { type: "movements", id: movementId },
      ],
    },
    readManyUsersMeMovementsGet: {
      providesTags: (result, error, arg) => [
        "users",
        ...cacheList("movements", result),
      ],
    },
    updateUsersMeMovementsMovementIdPut: {
      invalidatesTags: (result, error, { movementId }) => [
        "users",
        { type: "movements", id: movementId },
      ],
    },
    addTransactionsUsersMeMovementsMovementIdTransactionsPut: {
      invalidatesTags: (result, error, { movementId }) => [
        "users",
        { type: "movements", id: movementId },
        ...cacheList("transactions", result?.transactions),
      ],
    },
    deleteUsersMeMovementsMovementIdDelete: {
      invalidatesTags: (result, error, arg) => [
        "users",
        { type: "movements", id: ALL },
      ],
    },

    // TRANSACTIONS CRUD
    createUsersMeAccountsAccountIdMovementsMovementIdTransactionsPost: {
      invalidatesTags: (result, error, { accountId, movementId }) => [
        "users",
        { type: "accounts", id: accountId },
        { type: "movements", id: movementId },
        { type: "transactions", id: ALL },
      ],
    },
    readManyUsersMeTransactionsGet: {
      providesTags: (result, error, arg) => [
        "users",
        ...cacheList("transactions", result),
      ],
    },
    readUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdGet:
      {
        providesTags: (
          result,
          error,
          { accountId, movementId, transactionId },
        ) => [
          "users",
          { type: "accounts", id: accountId },
          { type: "movements", id: movementId },
          { type: "transactions", id: transactionId },
        ],
      },
    updateUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdPut:
      {
        invalidatesTags: (
          result,
          error,
          { accountId, movementId, transactionId },
        ) => [
          "users",
          { type: "accounts", id: accountId },
          { type: "movements", id: movementId },
          { type: "transactions", id: transactionId },
        ],
      },
    deleteUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdDelete:
      {
        invalidatesTags: (result, error, { accountId, movementId }) => [
          "users",
          { type: "accounts", id: accountId },
          { type: "movements", id: movementId },
          { type: "transactions", id: ALL },
        ],
      },

    // FILES CRUD
    createUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesPost:
      {
        invalidatesTags: (
          result,
          error,
          { accountId, movementId, transactionId },
        ) => [
          "users",
          { type: "accounts", id: accountId },
          { type: "movements", id: movementId },
          { type: "transactions", id: transactionId },
          { type: "files", id: ALL },
        ],
      },
    readUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesFileIdGet:
      {
        query: ({ accountId, movementId, transactionId, fileId }) => ({
          url: `/api/users/me/accounts/${accountId}/movements/${movementId}/transactions/${transactionId}/files/${fileId}`,
          responseHandler: (response) => response.blob(),
        }),
        providesTags: (
          result,
          error,
          { accountId, movementId, transactionId, fileId },
        ) => [
          "users",
          { type: "accounts", id: accountId },
          { type: "movements", id: movementId },
          { type: "transactions", id: transactionId },
          { type: "files", id: fileId },
        ],
      },
    readManyUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesGet:
      {
        providesTags: (
          result,
          error,
          { accountId, movementId, transactionId },
        ) => [
          "users",
          { type: "accounts", id: accountId },
          { type: "movements", id: movementId },
          { type: "transactions", id: transactionId },
          ...cacheList("files", result),
        ],
      },
    deleteUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesFileIdDelete:
      {
        invalidatesTags: (
          result,
          error,
          { accountId, movementId, transactionId },
        ) => [
          "users",
          { type: "accounts", id: accountId },
          { type: "movements", id: movementId },
          { type: "transactions", id: transactionId },
          { type: "files", id: ALL },
        ],
      },
  },
});

export * from "./generatedApi";
export type AccountApiOut = ReadUsersMeAccountsAccountIdGetApiResponse;
export type AccountApiIn = CreateUsersMeAccountsPostApiArg["body"];
export type AccountType = AccountApiIn["type"];
export { enhancedApi as api };
