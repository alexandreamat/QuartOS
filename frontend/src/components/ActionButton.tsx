import {
  Button,
  Popup,
  SemanticCOLORS,
  SemanticICONS,
} from "semantic-ui-react";

const ActionButton = (props: {
  onClick: () => void;
  tooltip: string;
  icon: SemanticICONS;
  disabled?: boolean;
  content?: string;
  loading?: boolean;
  color?: SemanticCOLORS;
}) => (
  <Popup
    content={props.tooltip}
    trigger={
      <Button
        color={props.color}
        loading={props.loading}
        circular
        basic
        size="tiny"
        icon={props.icon}
        onClick={props.onClick}
        content={props.content}
      />
    }
  />
);

export default ActionButton;
