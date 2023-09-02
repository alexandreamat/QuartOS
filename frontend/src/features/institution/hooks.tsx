import { api } from "app/services/api";
import { DropdownItemProps } from "semantic-ui-react";
import { renderErrorMessage } from "utils/error";

export function useInstitutionOptions() {
  const institutionsQuery = api.endpoints.readManyApiInstitutionsGet.useQuery();

  const institutionOptions: DropdownItemProps[] =
    institutionsQuery.data?.map((institution) => ({
      key: institution.id,
      value: institution.id,
      text: institution.name,
      image: `data:image/png;base64,${institution.logo_base64}`,
    })) || [];

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
