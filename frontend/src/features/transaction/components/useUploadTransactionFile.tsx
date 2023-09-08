import {
  BodyCreateApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesPost,
  TransactionApiOut,
  api,
} from "app/services/api";
import { logMutationError } from "utils/error";

export function useUploadTransactionFile(transaction?: TransactionApiOut) {
  const [uploadFile, uploadFileResult] =
    api.endpoints.createApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesPost.useMutation();

  async function handleUploadFile(file: File) {
    if (!transaction) return;

    const formData = new FormData();
    formData.append("file", file);
    try {
      await uploadFile({
        accountId: transaction.account_id,
        movementId: transaction.movement_id,
        transactionId: transaction.id,
        bodyCreateApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesPost:
          formData as unknown as BodyCreateApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesPost,
      }).unwrap();
    } catch (error) {
      logMutationError(error, uploadFileResult);
      return;
    }
  }
  return { onUpload: handleUploadFile };
}
