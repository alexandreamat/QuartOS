import { api } from "app/services/api";

export function useTransactionDeserialiserOptions() {
  const query = api.endpoints.readManyApiTransactionDeserialisersGet.useQuery();

  const options = query.data?.map((deserialiser) => {
    return {
      key: deserialiser.id,
      value: deserialiser.id,
      text: deserialiser.module_name,
    };
  });

  return {
    options,
    query,
  };
}
