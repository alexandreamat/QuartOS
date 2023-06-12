import { UserInstitutionLinkApiOut, api } from "app/services/api";

export default function InstitutionLinkOption(props: {
  institutionLink: UserInstitutionLinkApiOut;
}) {
  const { data: institution } = api.endpoints.readApiInstitutionsIdGet.useQuery(
    props.institutionLink.institution_id
  );

  return <>{institution?.name}</>;
}
