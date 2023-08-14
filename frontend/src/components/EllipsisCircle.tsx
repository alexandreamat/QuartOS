import { Icon } from "semantic-ui-react";

export function EllipsisCircle(props: { onClick: () => void }) {
  return (
    <div onClick={props.onClick} style={{ cursor: "pointer" }}>
      <Icon name="ellipsis horizontal" color="grey" />
    </div>
  );
}

function EllipsisCirclePlaceholder() {
  return <Icon name="ellipsis horizontal" disabled loading color="grey" />;
}

EllipsisCircle.Placeholder = EllipsisCirclePlaceholder;
