import { api } from "app/services/api";
import { DropdownItemProps } from "semantic-ui-react";

export function useInstitutionOptions() {
  const query = api.endpoints.readManyApiInstitutionsGet.useQuery();

  const options: DropdownItemProps[] =
    query.data?.map((institution) => ({
      key: institution.id,
      value: institution.id,
      text: institution.name,
      image: `data:image/png;base64,${institution.logo_base64}`,
    })) || [];

  return {
    options,
    query,
  };
}
