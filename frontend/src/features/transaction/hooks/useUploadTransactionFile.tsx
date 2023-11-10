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

  return {
    onUpload: handleUploadFile,
    result: uploadFileResult,
  };
}
