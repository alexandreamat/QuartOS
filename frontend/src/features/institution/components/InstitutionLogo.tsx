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
      <Placeholder style={props.style} className="right floated image">
        <Placeholder.Image square />
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

  return (
    <Icon
      className="right floated image"
      size="large"
      name="university"
      style={props.style}
    />
  );
}
