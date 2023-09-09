import { ReactNode } from "react";
import { Button, Menu } from "semantic-ui-react";

export default function SpanButton(props: {
  loading?: boolean;
  negative?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <Menu secondary>
      <Menu.Item style={{ width: "100%" }}>
        <Button
          fluid
          positive
          circular
          disabled={props.disabled}
          onClick={props.onClick}
          loading={props.loading}
          negative={props.negative}
        >
          {props.children}
        </Button>
      </Menu.Item>
    </Menu>
  );
}
