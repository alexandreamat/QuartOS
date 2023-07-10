import { SimpleQuery } from "interfaces";
import {
  Button,
  Popup,
  SemanticCOLORS,
  SemanticFLOATS,
  SemanticICONS,
} from "semantic-ui-react";
import { renderErrorMessage } from "utils/error";

const ActionButton = (props: {
  onClick: () => void;
  tooltip: string;
  icon: SemanticICONS;
  disabled?: boolean;
  content?: string;
  query?: SimpleQuery;
  color?: SemanticCOLORS;
  floated?: SemanticFLOATS;
}) => (
  <Popup
    content={
      props.query?.isError
        ? renderErrorMessage(props.query!.error!)
        : props.tooltip
    }
    trigger={
      <Button
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
      />
    }
  />
);

export default ActionButton;
