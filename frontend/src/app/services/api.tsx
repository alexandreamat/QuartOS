import { generatedApi } from "./generatedApi";

const enhancedApi = generatedApi.enhanceEndpoints({
  endpoints: {
    readApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesFileIdGet:
      {
        query: (queryArg) => ({
          url: `/api/users/me/accounts/${queryArg.accountId}/movements/${queryArg.movementId}/transactions/${queryArg.transactionId}/files/${queryArg.fileId}`,
          responseHandler: (response) => response.blob(),
        }),
      },
  },
});

export * from "./generatedApi";

export { enhancedApi as api };
