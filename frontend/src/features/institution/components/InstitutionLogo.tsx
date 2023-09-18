import { Image, Icon, SemanticFLOATS, Placeholder } from "semantic-ui-react";
import { InstitutionApiOut } from "app/services/api";
import { CSSProperties } from "react";

export function InstitutionLogo(props: {
  institution?: InstitutionApiOut;
  height?: number;
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          ...props.style,
        }}
      >
        <Image
          floated={props.floated}
          style={{ width: "auto", height: "100%" }}
          src={`data:image/png;base64,${props.institution.logo_base64}`}
        />
      </div>
    );

  return <Icon size="large" name="university" style={props.style} />;
}
