import { api } from "app/services/api";
import { renderErrorMessage } from "utils/error";

export function useTransactionDeserialiserOptions() {
  const transactionDeserialisersQuery =
    api.endpoints.readManyApiTransactionDeserialisersGet.useQuery();

  const transactionDeserialiserOptions =
    transactionDeserialisersQuery.data?.map((deserialiser) => {
      return {
        key: deserialiser.id,
        value: deserialiser.id,
        text: deserialiser.module_name,
      };
    });

  return {
    data: transactionDeserialiserOptions,
    isLoading: transactionDeserialisersQuery.isLoading,
    isError: transactionDeserialisersQuery.isError,
    isSuccess: transactionDeserialisersQuery.isSuccess,
    error: transactionDeserialisersQuery.isError
      ? renderErrorMessage(transactionDeserialisersQuery.error)
      : undefined,
  };
}
