import { Image, Icon, SemanticFLOATS, Placeholder } from "semantic-ui-react";
import { InstitutionApiOut } from "app/services/api";

export function InstitutionLogo(props: {
  institution?: InstitutionApiOut;
  height?: number;
  floated?: SemanticFLOATS;
  loading?: boolean;
}) {
  if (props.loading)
    return (
      <Placeholder image>
        <Placeholder.Header />
      </Placeholder>
    );

  if (props.institution?.logo_base64 !== undefined)
    return (
      <Image
        floated={props.floated}
        inline
        style={{ margin: 0, height: props.height ? props.height : 24 }}
        src={`data:image/png;base64,${props.institution.logo_base64}`}
      />
    );

  return <Icon size="large" name="university" />;
}
