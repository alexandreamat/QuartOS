import { Image, Icon, SemanticSIZES } from "semantic-ui-react";
import { InstitutionApiOut } from "app/services/api";

export function InstitutionLogo(props: {
  institution: InstitutionApiOut;
  size?: SemanticSIZES;
}) {
  return (
    <>
      {props.institution.logo_base64 ? (
        <Image
          size={props.size}
          inline
          style={props.size ? {} : { height: 24 }}
          src={`data:image/png;base64,${props.institution.logo_base64}`}
        />
      ) : (
        <Icon size="large" name="university" />
      )}
    </>
  );
}
