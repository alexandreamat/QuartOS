import { UserInstitutionLinkApiOut, api } from "app/services/api";

export function InstitutionLinkOption(props: {
  institutionLink: UserInstitutionLinkApiOut;
}) {
  const { data: institution } =
    api.endpoints.readApiInstitutionsInstitutionIdGet.useQuery(
      props.institutionLink.institution_id
    );

  return <>{institution?.name}</>;
}
