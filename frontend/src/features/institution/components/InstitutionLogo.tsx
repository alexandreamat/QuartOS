import { Image, Icon, SemanticFLOATS, Placeholder } from "semantic-ui-react";
import { InstitutionApiOut } from "app/services/api";
import { CSSProperties } from "react";

export function InstitutionLogo(props: {
  institution?: InstitutionApiOut;
  floated?: SemanticFLOATS;
  loading?: boolean;
  style?: CSSProperties;
}) {
  if (props.loading)
    return (
      <Placeholder image style={props.style}>
        <Placeholder.Header />
      </Placeholder>
    );

  if (props.institution?.logo_base64 !== undefined)
    return (
      <Image
        centered
        floated={props.floated}
        style={{ ...props.style, height: "auto" }}
        src={`data:image/png;base64,${props.institution.logo_base64}`}
      />
    );

  return <Icon size="large" name="university" style={props.style} />;
}
