import {
  generatedApi,
  ReadApiUsersMeAccountsAccountIdGetApiResponse,
  CreateApiUsersMeAccountsPostApiArg,
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
    createApiUsersMeMovementsPost: {
      invalidatesTags: (result, error, arg) => [
        "users",
        { type: "movements", id: ALL },
      ],
    },
    createManyApiUsersMeAccountsAccountIdMovementsPost: {
      invalidatesTags: (result, error, { accountId }) => [
        "users",
        { type: "accounts", id: accountId },
        ...cacheList("movements", result),
      ],
    },
    readApiUsersMeMovementsMovementIdGet: {
      providesTags: (result, error, movementId) => [
        "users",
        { type: "movements", id: movementId },
      ],
    },
    readManyApiUsersMeMovementsGet: {
      providesTags: (result, error, arg) => [
        "users",
        ...cacheList("movements", result),
      ],
    },
    updateApiUsersMeMovementsMovementIdPut: {
      invalidatesTags: (result, error, { movementId }) => [
        "users",
        { type: "movements", id: movementId },
      ],
    },
    addTransactionsApiUsersMeMovementsMovementIdTransactionsPut: {
      invalidatesTags: (result, error, { movementId }) => [
        "users",
        { type: "movements", id: movementId },
        ...cacheList("transactions", result?.transactions),
      ],
    },
    deleteApiUsersMeMovementsMovementIdDelete: {
      invalidatesTags: (result, error, arg) => [
        "users",
        { type: "movements", id: ALL },
      ],
    },

    // TRANSACTIONS CRUD
    createApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsPost: {
      invalidatesTags: (result, error, { accountId, movementId }) => [
        "users",
        { type: "accounts", id: accountId },
        { type: "movements", id: movementId },
        { type: "transactions", id: ALL },
      ],
    },
    readManyApiUsersMeTransactionsGet: {
      providesTags: (result, error, arg) => [
        "users",
        ...cacheList("transactions", result),
      ],
    },
    readApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdGet:
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
    updateApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdPut:
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
    deleteApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdDelete:
      {
        invalidatesTags: (result, error, { accountId, movementId }) => [
          "users",
          { type: "accounts", id: accountId },
          { type: "movements", id: movementId },
          { type: "transactions", id: ALL },
        ],
      },

    // FILES CRUD
    createApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesPost:
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
    readApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesFileIdGet:
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
    readManyApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesGet:
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
    deleteApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesFileIdDelete:
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
export type AccountApiOut = ReadApiUsersMeAccountsAccountIdGetApiResponse;
export type AccountApiIn = CreateApiUsersMeAccountsPostApiArg["body"];
export type AccountType = AccountApiIn["type"];
export { enhancedApi as api };
