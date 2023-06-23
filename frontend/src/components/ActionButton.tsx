import { Button, SemanticCOLORS, SemanticICONS } from "semantic-ui-react";

const ActionButton = (props: {
  onClick: () => void;
  icon: SemanticICONS;
  disabled?: boolean;
  content?: string;
  loading?: boolean;
  color?: SemanticCOLORS;
}) => (
  <Button
    color={props.color}
    loading={props.loading}
    disabled={props.disabled}
    circular
    basic
    size="tiny"
    icon={props.icon}
    onClick={props.onClick}
    content={props.content}
  />
);

export default ActionButton;
