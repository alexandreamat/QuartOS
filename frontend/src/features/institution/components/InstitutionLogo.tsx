import { Image, Icon, SemanticFLOATS } from "semantic-ui-react";
import { InstitutionApiOut } from "app/services/api";

export function InstitutionLogo(props: {
  institution: InstitutionApiOut;
  height?: number;
  floated?: SemanticFLOATS;
}) {
  return (
    <>
      {props.institution.logo_base64 ? (
        <Image
          floated={props.floated}
          inline
          style={{ margin: 0, height: props.height ? props.height : 24 }}
          src={`data:image/png;base64,${props.institution.logo_base64}`}
        />
      ) : (
        <Icon size="large" name="university" />
      )}
    </>
  );
}
