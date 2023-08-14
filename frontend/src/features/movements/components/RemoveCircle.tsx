import { Icon } from "semantic-ui-react";

export function RemoveCircle(props: { onClick: () => void }) {
  return (
    <div onClick={props.onClick} style={{ cursor: "pointer" }}>
      <Icon name="remove circle" color="grey" />
    </div>
  );
}

function RemoveCirclePlaceholder() {
  return <Icon name="remove circle" disabled color="grey" />;
}

RemoveCircle.Placeholder = RemoveCirclePlaceholder;
