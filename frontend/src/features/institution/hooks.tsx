import { api } from "app/services/api";
import { renderErrorMessage } from "utils/error";

export function useInstitutionOptions() {
  const institutionsQuery = api.endpoints.readManyApiInstitutionsGet.useQuery();

  const institutionOptions = institutionsQuery.data?.map((institution) => ({
    key: institution.id,
    value: institution.id,
    text: institution.name,
    flag: institution.country_code.toLocaleLowerCase(),
  }));

  return {
    data: institutionOptions,
    isLoading: institutionsQuery.isLoading,
    isSuccess: institutionsQuery.isSuccess,
    isError: institutionsQuery.isError,
    error: institutionsQuery.isError
      ? renderErrorMessage(institutionsQuery.error)
      : undefined,
  };
}
