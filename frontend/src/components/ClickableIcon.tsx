import { Icon, SemanticICONS } from "semantic-ui-react";

export function ClickableIcon(props: {
  name: SemanticICONS;
  onClick: () => void;
}) {
  return (
    <div onClick={props.onClick} style={{ cursor: "pointer" }}>
      <Icon name={props.name} color="grey" />
    </div>
  );
}

function ClickableIconPlaceholder(props: { name: SemanticICONS }) {
  return <Icon name={props.name} disabled color="grey" />;
}

ClickableIcon.Placeholder = ClickableIconPlaceholder;
