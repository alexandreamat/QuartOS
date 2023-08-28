import { SimpleQuery } from "interfaces";
import { CSSProperties } from "react";
import {
  Button,
  Popup,
  SemanticCOLORS,
  SemanticFLOATS,
  SemanticICONS,
} from "semantic-ui-react";
import { renderErrorMessage } from "utils/error";

const ActionButton = (props: {
  onClick?: () => void;
  tooltip: string;
  icon: SemanticICONS;
  disabled?: boolean;
  content?: string;
  query?: SimpleQuery;
  color?: SemanticCOLORS;
  floated?: SemanticFLOATS;
  style?: CSSProperties;
}) => (
  <Popup
    content={
      props.query?.isError
        ? renderErrorMessage(props.query!.error!)
        : props.tooltip
    }
    trigger={
      <Button
        disabled={props.disabled}
        floated={props.floated}
        color={props.color}
        loading={props.query?.isLoading}
        negative={props.query?.isError}
        circular
        basic
        size="tiny"
        icon={props.icon}
        onClick={props.onClick}
        content={props.content}
        style={props.style}
      />
    }
  />
);

const ActionButtonPlaceholder = (props: {
  icon: SemanticICONS;
  disabled?: boolean;
  content?: string;
  query?: SimpleQuery;
  color?: SemanticCOLORS;
  floated?: SemanticFLOATS;
  style?: CSSProperties;
}) => (
  <Button
    disabled
    icon={props.icon}
    style={props.style}
    floated={props.floated}
    loading
    circular
    basic
    size="tiny"
    color={props.color}
    content={props.content}
  />
);

ActionButton.Placeholder = ActionButtonPlaceholder;

export default ActionButton;
