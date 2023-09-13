import { CSSProperties } from "react";
import {
  Button,
  SemanticCOLORS,
  SemanticFLOATS,
  SemanticICONS,
} from "semantic-ui-react";

const ActionButton = (props: {
  onClick?: () => void;
  tooltip?: string;
  icon: SemanticICONS;
  disabled?: boolean;
  content?: string;
  color?: SemanticCOLORS;
  floated?: SemanticFLOATS;
  style?: CSSProperties;
  loading?: boolean;
  negative?: boolean;
}) => (
  <Button
    disabled={props.disabled}
    floated={props.floated}
    color={props.color}
    loading={props.loading}
    negative={props.negative}
    circular
    basic
    size="tiny"
    icon={props.icon}
    onClick={props.onClick}
    content={props.content}
    style={props.style}
  />
);

export default ActionButton;
