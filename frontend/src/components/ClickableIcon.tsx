import { Icon, SemanticICONS } from "semantic-ui-react";

const ClickableIcon = (props: {
  name: SemanticICONS;
  onClick?: () => void;
  loading?: boolean;
}) => (
  <div onClick={props.onClick} style={{ cursor: "pointer" }}>
    <Icon name={props.name} color="grey" disabled={props.loading} />
  </div>
);

export default ClickableIcon;
