import { Image, Icon } from "semantic-ui-react";
import { InstitutionApiOut } from "app/services/api";

export function InstitutionLogo(props: {
  institution: InstitutionApiOut;
  height?: number;
}) {
  return (
    <>
      {props.institution.logo_base64 ? (
        <Image
          inline
          style={{ height: props.height ? props.height : 24 }}
          src={`data:image/png;base64,${props.institution.logo_base64}`}
        />
      ) : (
        <Icon size="large" name="university" />
      )}
    </>
  );
}
