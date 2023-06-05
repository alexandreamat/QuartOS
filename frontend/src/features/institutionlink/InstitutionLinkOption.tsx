import { UserInstitutionLinkApiOut, api } from "app/services/api";

export default function InstitutionLinkOption(props: {
  link: UserInstitutionLinkApiOut;
}) {
  const { data: institution } = api.endpoints.readApiInstitutionsIdGet.useQuery(
    props.link.institution_id
  );

  return <>{institution?.name}</>;
}
