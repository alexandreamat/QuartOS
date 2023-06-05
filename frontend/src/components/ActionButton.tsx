import { Button, SemanticICONS } from "semantic-ui-react";

const ActionButton = (props: {
  onClick: () => void;
  icon: SemanticICONS;
  disabled?: boolean;
  content?: string;
  loading?: boolean;
}) => (
  <Button
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
